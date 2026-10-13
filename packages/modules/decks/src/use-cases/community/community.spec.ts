// Path: packages/modules/decks/src/use-cases/community/community.spec.ts
// Critérios da task 64 (comunidade de decks):
// - publish congela snapshot do deck SALVO e bloqueia deck ilegal
// - unpublish preserva likes e some do feed
// - feed top/new/filtro cor/busca (página sem COUNT total)
// - like/unlike (autor bloqueado, idempotente)
// - recordCopy só conta 1x
// - publications marca `outdated`
import { describe, expect, it } from 'vitest'
import type { PaginatedResult, Role } from '@digimon/contracts'
import {
  ConflictError,
  ForbiddenError,
  InMemoryEventBus,
  NotFoundError,
  ValidationError
} from '@digimon/contracts'
import type { Actor } from '../../domain/actor'
import type { CardColorInfo, DeckColorResolver } from '../../domain/community/community-colors'
import { reviewDeckName } from '../../domain/community/deck-name-moderation'
import type { CommunityDeckStatus } from '../../domain/community/community-types'
import { Deck, type DeckCardEntry, type DeckData } from '../../domain/entities/deck'
import type { DeckCopyData } from '../../domain/entities/deck-copy'
import { PublicDeck, type PublicDeckData } from '../../domain/entities/public-deck'
import type {
  CardReferenceInfo,
  CardReferenceValidator
} from '../../domain/repositories/card-reference-validator'
import type { DeckRepository, ListDecksParams } from '../../domain/repositories/deck-repository'
import type {
  CopyResult,
  LikeResult,
  ListPublicDecksQuery,
  PublicDeckPage,
  PublicDeckRecord,
  PublicDeckRepository,
  PublicationRecord,
  UnlikeResult
} from '../../domain/repositories/public-deck-repository'
import { CheckDeckLegalityUseCase } from '../check-deck-legality'
import { GetCommunityDeckUseCase } from './get-community-deck'
import { LikeCommunityDeckUseCase } from './like-community-deck'
import { ListCommunityDecksUseCase } from './list-community-decks'
import { ListPublicationsUseCase } from './list-publications'
import { PublishDeckToCommunityUseCase } from './publish-deck-to-community'
import { RecordDeckCopyUseCase } from './record-deck-copy'
import { UnlikeCommunityDeckUseCase } from './unlike-community-deck'
import { UnpublishDeckFromCommunityUseCase } from './unpublish-deck-from-community'

// --- Catálogo fake -----------------------------------------------------------

type FakeCardType = 'digimon' | 'option' | 'tamer' | 'digiegg'

interface FakeCard {
  id: string
  type: FakeCardType
  maxCountInDeck: number
  colors: string[]
}

const CATALOG: FakeCard[] = [
  ...Array.from(
    { length: 13 },
    (_, i): FakeCard => ({ id: `red-${i + 1}`, type: 'digimon', maxCountInDeck: 4, colors: ['RED'] })
  ),
  ...Array.from(
    { length: 13 },
    (_, i): FakeCard => ({ id: `blue-${i + 1}`, type: 'digimon', maxCountInDeck: 4, colors: ['BLUE'] })
  ),
  { id: 'egg-1', type: 'digiegg', maxCountInDeck: 4, colors: ['RED'] },
  { id: 'egg-2', type: 'digiegg', maxCountInDeck: 4, colors: ['BLUE'] }
]

const CATALOG_BY_ID = new Map(CATALOG.map((card) => [card.id, card]))

class FakeCardReferenceValidator implements CardReferenceValidator {
  async assertCardsExist(entries: DeckCardEntry[]): Promise<void> {
    for (const entry of entries) {
      if (!CATALOG_BY_ID.has(entry.cardId)) {
        throw new ValidationError(`Carta não encontrada: ${entry.cardId}`)
      }
    }
  }

  async inspect(entries: DeckCardEntry[]): Promise<CardReferenceInfo[]> {
    return entries.map((entry) => {
      const card = CATALOG_BY_ID.get(entry.cardId)
      return {
        cardId: entry.cardId,
        quantity: entry.quantity,
        exists: card !== undefined,
        maxCountInDeck: card?.maxCountInDeck ?? 4,
        isDigiEgg: card?.type === 'digiegg'
      }
    })
  }
}

class FakeDeckColorResolver implements DeckColorResolver {
  async resolveColors(entries: DeckCardEntry[]): Promise<CardColorInfo[]> {
    return entries.map((entry) => ({
      cardId: entry.cardId,
      colors: CATALOG_BY_ID.get(entry.cardId)?.colors ?? []
    }))
  }
}

// --- Repositórios fake -------------------------------------------------------

class InMemoryDeckRepository implements DeckRepository {
  private readonly decks = new Map<string, Deck>()
  private readonly copies: DeckCopyData[] = []

  async create(data: DeckData): Promise<void> {
    this.decks.set(data.id, Deck.fromData(data))
  }

  async update(deck: Deck): Promise<void> {
    this.decks.set(deck.id, deck)
  }

  async delete(id: string): Promise<void> {
    this.decks.delete(id)
  }

  async findById(id: string): Promise<Deck | null> {
    return this.decks.get(id) ?? null
  }

  async findBySlug(slug: string): Promise<Deck | null> {
    for (const deck of this.decks.values()) {
      if (deck.slug === slug) return deck
    }
    return null
  }

  async list(params: ListDecksParams): Promise<PaginatedResult<Deck>> {
    const items = [...this.decks.values()]
    return { items, total: items.length, page: params.page ?? 1, pageSize: params.pageSize ?? 20 }
  }

  async createCopy(data: DeckCopyData): Promise<void> {
    this.copies.push(data)
  }
}

class InMemoryPublicDeckRepository implements PublicDeckRepository {
  private readonly decks = new Map<string, PublicDeck>()
  private readonly ownerNames = new Map<string, string>()
  private readonly likes = new Map<string, Map<string, Date>>()
  private readonly copies = new Map<string, Set<string>>()
  readonly sourceUpdatedAt = new Map<string, Date>()

  setOwnerName(accountId: string, name: string): void {
    this.ownerNames.set(accountId, name)
  }

  setSourceUpdatedAt(sourceDeckId: string, at: Date): void {
    this.sourceUpdatedAt.set(sourceDeckId, at)
  }

  /** Helper de teste: insere um snapshot direto, sem passar pelo use case. */
  seed(data: PublicDeckData): void {
    this.decks.set(data.id, PublicDeck.fromData(data))
  }

  async create(data: PublicDeckData): Promise<void> {
    this.seed(data)
  }

  async update(deck: PublicDeck): Promise<void> {
    this.decks.set(deck.id, deck)
  }

  async findBySourceDeck(accountId: string, sourceDeckId: string): Promise<PublicDeck | null> {
    for (const deck of this.decks.values()) {
      if (deck.accountId === accountId && deck.sourceDeckId === sourceDeckId) return deck
    }
    return null
  }

  async findById(id: string, viewerId?: string | null): Promise<PublicDeckRecord | null> {
    const deck = this.decks.get(id)
    if (!deck) return null
    return {
      deck,
      ownerName: this.ownerName(deck.accountId),
      likedByMe: this.hasLike(id, viewerId)
    }
  }

  async list(query: ListPublicDecksQuery): Promise<PublicDeckPage> {
    let items = [...this.decks.values()].filter((deck) => deck.status === query.status)

    const colors = query.colors
    if (colors && colors.length > 0) {
      items = items.filter((deck) => colors.every((c) => deck.data.colors.includes(c)))
    }

    const search = query.search?.toLowerCase()
    if (search) {
      items = items.filter(
        (deck) =>
          deck.data.name.toLowerCase().includes(search) ||
          this.ownerName(deck.accountId).toLowerCase().includes(search)
      )
    }

    const since = query.since
    if (query.sort === 'new') {
      items.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
    } else if (since) {
      items.sort(
        (a, b) =>
          this.recentLikes(b, since) - this.recentLikes(a, since) ||
          b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
      )
    } else {
      items.sort(
        (a, b) =>
          b.data.likeCount - a.data.likeCount ||
          b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
      )
    }

    const start = (query.page - 1) * query.pageSize
    const page = items.slice(start, start + query.pageSize)
    return {
      items: page.map((deck) => ({
        deck,
        ownerName: this.ownerName(deck.accountId),
        likedByMe: this.hasLike(deck.id, query.viewerId)
      })),
      hasMore: items.length > start + query.pageSize
    }
  }

  async publications(ownerId: string): Promise<PublicationRecord[]> {
    return [...this.decks.values()]
      .filter((deck) => deck.accountId === ownerId && deck.status !== 'unpublished')
      .map((deck) => ({
        deck,
        sourceUpdatedAt: this.sourceUpdatedAt.get(deck.sourceDeckId) ?? deck.updatedAt
      }))
  }

  async unpublish(id: string): Promise<void> {
    const deck = this.decks.get(id)
    if (deck) deck.data.status = 'unpublished'
  }

  async like(publicDeckId: string, accountId: string): Promise<LikeResult> {
    const deck = this.decks.get(publicDeckId)
    if (!deck) return { created: false, likeCount: 0 }
    const map = this.likes.get(publicDeckId) ?? new Map<string, Date>()
    if (map.has(accountId)) return { created: false, likeCount: deck.data.likeCount }
    map.set(accountId, new Date())
    this.likes.set(publicDeckId, map)
    deck.data.likeCount += 1
    return { created: true, likeCount: deck.data.likeCount }
  }

  async unlike(publicDeckId: string, accountId: string): Promise<UnlikeResult> {
    const deck = this.decks.get(publicDeckId)
    if (!deck) return { removed: false, likeCount: 0 }
    const map = this.likes.get(publicDeckId)
    if (!map || !map.has(accountId)) return { removed: false, likeCount: deck.data.likeCount }
    map.delete(accountId)
    deck.data.likeCount = Math.max(0, deck.data.likeCount - 1)
    return { removed: true, likeCount: deck.data.likeCount }
  }

  async addCopy(publicDeckId: string, accountId: string): Promise<CopyResult> {
    const deck = this.decks.get(publicDeckId)
    if (!deck) return { created: false, copyCount: 0 }
    const set = this.copies.get(publicDeckId) ?? new Set<string>()
    if (set.has(accountId)) return { created: false, copyCount: deck.data.copyCount }
    set.add(accountId)
    this.copies.set(publicDeckId, set)
    deck.data.copyCount += 1
    return { created: true, copyCount: deck.data.copyCount }
  }

  private ownerName(accountId: string): string {
    return this.ownerNames.get(accountId) ?? 'Anônimo'
  }

  private hasLike(publicDeckId: string, accountId: string | null | undefined): boolean {
    if (!accountId) return false
    return this.likes.get(publicDeckId)?.has(accountId) ?? false
  }

  private recentLikes(deck: PublicDeck, since: Date): number {
    const map = this.likes.get(deck.id)
    if (!map) return 0
    let count = 0
    for (const at of map.values()) {
      if (at.getTime() >= since.getTime()) count += 1
    }
    return count
  }
}

// --- Helpers -----------------------------------------------------------------

function actor(role: Role, id = 'user-1'): Actor {
  return { id, role }
}

const member = actor('member')
const otherMember = actor('member', 'user-9')
const editor = actor('editor', 'user-editor')

function legalMain(color: 'red' | 'blue'): DeckCardEntry[] {
  return [
    ...Array.from(
      { length: 12 },
      (_, i): DeckCardEntry => ({ cardId: `${color}-${i + 1}`, quantity: 4 })
    ),
    { cardId: `${color}-13`, quantity: 2 }
  ]
}

function setup() {
  const deckRepo = new InMemoryDeckRepository()
  const publicRepo = new InMemoryPublicDeckRepository()
  const cards = new FakeCardReferenceValidator()
  const colors = new FakeDeckColorResolver()
  const eventBus = new InMemoryEventBus()
  const events: string[] = []
  for (const type of [
    'deck.publication.published',
    'deck.publication.unpublished',
    'deck.publication.liked'
  ]) {
    eventBus.subscribe(type, (event) => {
      events.push(event.type)
    })
  }

  publicRepo.setOwnerName(member.id, 'Ash')
  publicRepo.setOwnerName(otherMember.id, 'Mimi')
  publicRepo.setOwnerName(editor.id, 'Editor')

  const legality = new CheckDeckLegalityUseCase(cards)

  return {
    deckRepo,
    publicRepo,
    events,
    publishToCommunity: new PublishDeckToCommunityUseCase(
      deckRepo,
      publicRepo,
      legality,
      colors,
      eventBus
    ),
    unpublishFromCommunity: new UnpublishDeckFromCommunityUseCase(deckRepo, publicRepo, eventBus),
    listPublications: new ListPublicationsUseCase(publicRepo),
    listCommunity: new ListCommunityDecksUseCase(publicRepo, legality),
    getCommunity: new GetCommunityDeckUseCase(publicRepo, legality),
    like: new LikeCommunityDeckUseCase(publicRepo, eventBus),
    unlike: new UnlikeCommunityDeckUseCase(publicRepo),
    recordCopy: new RecordDeckCopyUseCase(publicRepo)
  }
}

async function seedDeck(
  repo: InMemoryDeckRepository,
  opts: { slug: string; name: string; ownerId: string; color: 'red' | 'blue' }
): Promise<string> {
  const deck = Deck.create({
    id: `deck-${opts.slug}`,
    slug: opts.slug,
    name: opts.name,
    ownerId: opts.ownerId,
    description: null,
    cardList: legalMain(opts.color),
    eggList: [],
    coverCardId: null,
    format: 'Standard',
    status: 'published',
    isPublic: true
  })
  await repo.create(deck.data)
  return deck.id
}

async function seedIllegalDeck(
  repo: InMemoryDeckRepository,
  ownerId: string,
  slug: string
): Promise<string> {
  const deck = Deck.create({
    id: `deck-${slug}`,
    slug,
    name: 'Deck Ilegal',
    ownerId,
    description: null,
    cardList: [{ cardId: 'red-1', quantity: 4 }],
    eggList: [],
    coverCardId: null,
    format: 'Standard',
    status: 'published',
    isPublic: true
  })
  await repo.create(deck.data)
  return deck.id
}

function makePublication(
  id: string,
  accountId: string,
  name: string,
  colors: string[],
  extra: {
    likeCount?: number
    publishedAt?: Date
    status?: CommunityDeckStatus
    sourceDeckId?: string
  } = {}
): PublicDeckData {
  const publishedAt = extra.publishedAt ?? new Date('2026-01-01T00:00:00.000Z')
  return {
    id,
    accountId,
    sourceDeckId: extra.sourceDeckId ?? `src-${id}`,
    name,
    colors,
    cardList: legalMain('red'),
    eggList: [],
    coverCardId: null,
    likeCount: extra.likeCount ?? 0,
    copyCount: 0,
    status: extra.status ?? 'public',
    publishedAt,
    updatedAt: publishedAt
  }
}

// --- Testes ------------------------------------------------------------------

describe('reviewDeckName', () => {
  it('normaliza espaços, aceita nome limpo e corta no tamanho máximo', () => {
    expect(reviewDeckName('  Deck   Legal ')).toEqual({ allowed: true, name: 'Deck Legal' })

    const long = reviewDeckName('x'.repeat(60))
    expect(long.allowed).toBe(true)
    expect(long.name).toHaveLength(40)
  })

  it('bloqueia termos proibidos e nome vazio', () => {
    expect(reviewDeckName('Deck do idiota').allowed).toBe(false)
    expect(reviewDeckName('   ').allowed).toBe(false)
  })
})

describe('PublishDeckToCommunityUseCase', () => {
  it('congela o snapshot do deck salvo (não do request) e emite published', async () => {
    const ctx = setup()
    const deckId = await seedDeck(ctx.deckRepo, {
      slug: 'agumon-rush',
      name: 'Agumon Rush',
      ownerId: member.id,
      color: 'red'
    })

    const result = await ctx.publishToCommunity.execute({ actor: member, slug: 'agumon-rush' })

    const record = await ctx.publicRepo.findById(result.id)
    expect(record?.deck.status).toBe('public')
    expect(record?.deck.data.name).toBe('Agumon Rush')
    expect(record?.deck.data.cardList).toEqual(legalMain('red'))
    expect(record?.deck.data.colors).toEqual(['RED'])
    expect(record?.ownerName).toBe('Ash')
    expect(result.sourceDeckId).toBe(deckId)
    expect(ctx.events).toEqual(['deck.publication.published'])
  })

  it('lê o cardList do repositório (re-publicar reflete o deck salvo atualizado)', async () => {
    const ctx = setup()
    await seedDeck(ctx.deckRepo, {
      slug: 'agumon-rush',
      name: 'Agumon Rush',
      ownerId: member.id,
      color: 'red'
    })
    const first = await ctx.publishToCommunity.execute({ actor: member, slug: 'agumon-rush' })

    const saved = await ctx.deckRepo.findBySlug('agumon-rush')
    saved?.update({ cardList: legalMain('blue') })
    if (saved) await ctx.deckRepo.update(saved)

    await ctx.publishToCommunity.execute({ actor: member, slug: 'agumon-rush' })
    const record = await ctx.publicRepo.findById(first.id)
    expect(record?.deck.data.cardList).toEqual(legalMain('blue'))
    expect(record?.deck.data.colors).toEqual(['BLUE'])
  })

  it('bloqueia deck ilegal (ValidationError) e não cria snapshot', async () => {
    const ctx = setup()
    await seedIllegalDeck(ctx.deckRepo, member.id, 'ilegal')

    await expect(
      ctx.publishToCommunity.execute({ actor: member, slug: 'ilegal' })
    ).rejects.toBeInstanceOf(ValidationError)
    expect(await ctx.listPublications.execute({ actor: member })).toHaveLength(0)
  })

  it('deck de outro dono → NotFoundError (não vaza existência)', async () => {
    const ctx = setup()
    await seedDeck(ctx.deckRepo, {
      slug: 'agumon-rush',
      name: 'Agumon Rush',
      ownerId: member.id,
      color: 'red'
    })

    await expect(
      ctx.publishToCommunity.execute({ actor: otherMember, slug: 'agumon-rush' })
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it('re-publicar uma publicação despublicada volta ao status public', async () => {
    const ctx = setup()
    await seedDeck(ctx.deckRepo, {
      slug: 'agumon-rush',
      name: 'Agumon Rush',
      ownerId: member.id,
      color: 'red'
    })
    const created = await ctx.publishToCommunity.execute({ actor: member, slug: 'agumon-rush' })
    await ctx.unpublishFromCommunity.execute({ actor: member, slug: 'agumon-rush' })

    const again = await ctx.publishToCommunity.execute({ actor: member, slug: 'agumon-rush' })
    expect(again.id).toBe(created.id)
    expect(again.status).toBe('public')
  })

  it('publicação oculta (legado) → ConflictError ao re-publicar', async () => {
    const ctx = setup()
    await seedDeck(ctx.deckRepo, {
      slug: 'agumon-rush',
      name: 'Agumon Rush',
      ownerId: member.id,
      color: 'red'
    })
    // O status HIDDEN só persiste de dados legados (a ação de moderação saiu);
    // publicar sobre uma publicação oculta segue bloqueado.
    ctx.publicRepo.seed(
      makePublication('hidden-1', member.id, 'Agumon Rush', ['RED'], {
        status: 'hidden',
        sourceDeckId: 'deck-agumon-rush'
      })
    )

    await expect(
      ctx.publishToCommunity.execute({ actor: member, slug: 'agumon-rush' })
    ).rejects.toBeInstanceOf(ConflictError)
  })
})

describe('UnpublishDeckFromCommunityUseCase', () => {
  it('preserva curtidas e some do feed', async () => {
    const ctx = setup()
    await seedDeck(ctx.deckRepo, {
      slug: 'agumon-rush',
      name: 'Agumon Rush',
      ownerId: member.id,
      color: 'red'
    })
    const created = await ctx.publishToCommunity.execute({ actor: member, slug: 'agumon-rush' })
    await ctx.like.execute({ actor: otherMember, publicDeckId: created.id })

    await ctx.unpublishFromCommunity.execute({ actor: member, slug: 'agumon-rush' })

    const record = await ctx.publicRepo.findById(created.id)
    expect(record?.deck.status).toBe('unpublished')
    expect(record?.deck.data.likeCount).toBe(1)
    expect((await ctx.listCommunity.execute({ input: {} })).items).toHaveLength(0)
    expect(ctx.events).toContain('deck.publication.unpublished')
  })
})

describe('ListCommunityDecksUseCase — feed', () => {
  function seedFeed() {
    const ctx = setup()
    ctx.publicRepo.seed(
      makePublication('p1', member.id, 'Agumon Rush', ['RED'], {
        likeCount: 10,
        publishedAt: new Date('2026-01-01T00:00:00.000Z')
      })
    )
    ctx.publicRepo.seed(
      makePublication('p2', otherMember.id, 'Gabumon Control', ['BLUE'], {
        likeCount: 3,
        publishedAt: new Date('2026-03-01T00:00:00.000Z')
      })
    )
    ctx.publicRepo.seed(
      makePublication('p3', editor.id, 'Red Blue Hybrid', ['RED', 'BLUE'], {
        likeCount: 7,
        publishedAt: new Date('2026-02-01T00:00:00.000Z')
      })
    )
    return ctx
  }

  it('sort=top ordena por curtidas', async () => {
    const ctx = seedFeed()
    const feed = await ctx.listCommunity.execute({ input: { sort: 'top' } })
    expect(feed.items.map((item) => item.id)).toEqual(['p1', 'p3', 'p2'])
  })

  it('sort=new ordena pela publicação mais recente', async () => {
    const ctx = seedFeed()
    const feed = await ctx.listCommunity.execute({ input: { sort: 'new' } })
    expect(feed.items.map((item) => item.id)).toEqual(['p2', 'p3', 'p1'])
  })

  it('filtra por cor', async () => {
    const ctx = seedFeed()
    const feed = await ctx.listCommunity.execute({ input: { colors: ['BLUE'] } })
    expect(feed.items.map((item) => item.id).sort()).toEqual(['p2', 'p3'])
  })

  it('busca por nome e por autor', async () => {
    const ctx = seedFeed()
    const byName = await ctx.listCommunity.execute({ input: { search: 'agumon' } })
    expect(byName.items.map((item) => item.id)).toEqual(['p1'])

    const byAuthor = await ctx.listCommunity.execute({ input: { search: 'mimi' } })
    expect(byAuthor.items.map((item) => item.id)).toEqual(['p2'])
  })

  it('página de 24 sem COUNT total (hasMore)', async () => {
    const ctx = setup()
    for (let i = 0; i < 30; i++) {
      ctx.publicRepo.seed(makePublication(`d${i}`, member.id, `Deck ${i}`, ['RED'], { likeCount: i }))
    }
    const feed = await ctx.listCommunity.execute({ input: { sort: 'top' } })
    expect(feed.items).toHaveLength(24)
    expect(feed.pageSize).toBe(24)
    expect(feed.hasMore).toBe(true)
  })

  it('likedByMe reflete a curtida do ator', async () => {
    const ctx = seedFeed()
    await ctx.like.execute({ actor: otherMember, publicDeckId: 'p1' })
    const feed = await ctx.listCommunity.execute({ input: {}, actor: otherMember })
    const p1 = feed.items.find((item) => item.id === 'p1')
    expect(p1?.likedByMe).toBe(true)
  })
})

describe('GetCommunityDeckUseCase', () => {
  it('detalhe público inclui composição e legalidade', async () => {
    const ctx = setup()
    ctx.publicRepo.seed(makePublication('p1', member.id, 'Meu Deck', ['RED']))
    const detail = await ctx.getCommunity.execute({ publicDeckId: 'p1' })
    expect(detail.legal).toBe(true)
    expect(detail.cardList).toEqual(legalMain('red'))
  })

  it('hidden (legado) não é visível a ninguém', async () => {
    const ctx = setup()
    ctx.publicRepo.seed(makePublication('p1', member.id, 'Meu Deck', ['RED'], { status: 'hidden' }))

    await expect(ctx.getCommunity.execute({ publicDeckId: 'p1' })).rejects.toBeInstanceOf(NotFoundError)
    await expect(
      ctx.getCommunity.execute({ publicDeckId: 'p1', actor: member })
    ).rejects.toBeInstanceOf(NotFoundError)
    await expect(
      ctx.getCommunity.execute({ publicDeckId: 'p1', actor: editor })
    ).rejects.toBeInstanceOf(NotFoundError)
  })
})

describe('LikeCommunityDeckUseCase / UnlikeCommunityDeckUseCase', () => {
  it('autor não curte o próprio deck (ForbiddenError)', async () => {
    const ctx = setup()
    ctx.publicRepo.seed(makePublication('p1', member.id, 'Meu Deck', ['RED']))

    await expect(ctx.like.execute({ actor: member, publicDeckId: 'p1' })).rejects.toBeInstanceOf(
      ForbiddenError
    )
  })

  it('1 curtida por conta (idempotente) e emite liked só na primeira', async () => {
    const ctx = setup()
    ctx.publicRepo.seed(makePublication('p1', member.id, 'Meu Deck', ['RED']))

    const first = await ctx.like.execute({ actor: otherMember, publicDeckId: 'p1' })
    expect(first).toEqual({ likeCount: 1, liked: true })

    const second = await ctx.like.execute({ actor: otherMember, publicDeckId: 'p1' })
    expect(second.likeCount).toBe(1)
    expect(ctx.events.filter((event) => event === 'deck.publication.liked')).toHaveLength(1)
  })

  it('unlike é idempotente', async () => {
    const ctx = setup()
    ctx.publicRepo.seed(makePublication('p1', member.id, 'Meu Deck', ['RED']))
    await ctx.like.execute({ actor: otherMember, publicDeckId: 'p1' })

    expect(await ctx.unlike.execute({ actor: otherMember, publicDeckId: 'p1' })).toEqual({
      likeCount: 0,
      liked: false
    })
    expect(await ctx.unlike.execute({ actor: otherMember, publicDeckId: 'p1' })).toEqual({
      likeCount: 0,
      liked: false
    })
  })
})

describe('RecordDeckCopyUseCase', () => {
  it('copia só conta 1x', async () => {
    const ctx = setup()
    ctx.publicRepo.seed(makePublication('p1', member.id, 'Meu Deck', ['RED']))

    expect(await ctx.recordCopy.execute({ actor: otherMember, publicDeckId: 'p1' })).toEqual({
      copyCount: 1,
      counted: true
    })
    expect(await ctx.recordCopy.execute({ actor: otherMember, publicDeckId: 'p1' })).toEqual({
      copyCount: 1,
      counted: false
    })
  })
})

describe('ListPublicationsUseCase', () => {
  it('marca outdated quando o deck de origem muda; unpublish sai da lista', async () => {
    const ctx = setup()
    const deckId = await seedDeck(ctx.deckRepo, {
      slug: 'agumon-rush',
      name: 'Agumon Rush',
      ownerId: member.id,
      color: 'red'
    })
    await ctx.publishToCommunity.execute({ actor: member, slug: 'agumon-rush' })

    const before = await ctx.listPublications.execute({ actor: member })
    expect(before).toHaveLength(1)
    expect(before[0]?.outdated).toBe(false)

    ctx.publicRepo.setSourceUpdatedAt(deckId, new Date(Date.now() + 60_000))
    const after = await ctx.listPublications.execute({ actor: member })
    expect(after[0]?.outdated).toBe(true)

    await ctx.unpublishFromCommunity.execute({ actor: member, slug: 'agumon-rush' })
    expect(await ctx.listPublications.execute({ actor: member })).toHaveLength(0)
  })
})
