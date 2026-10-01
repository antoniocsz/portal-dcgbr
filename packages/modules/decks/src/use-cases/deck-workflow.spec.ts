// Path: packages/modules/decks/src/use-cases/deck-workflow.spec.ts
// Critérios da task 06:
// - Member publica deck próprio direto (sem revisão)
// - Member NÃO edita deck de outro (ForbiddenError)
// - CopyDeck cria deck próprio do copiador
// - cardList valida cartas existentes
// - rascunho não aparece na listagem pública
import { describe, expect, it } from 'vitest'
import type { PaginatedResult, Role } from '@digimon/contracts'
import {
  ConflictError,
  ForbiddenError,
  InMemoryEventBus,
  NotFoundError,
  ValidationError
} from '@digimon/contracts'
import type { Actor } from '../domain/actor'
import {
  Deck,
  type DeckCardEntry,
  type DeckData
} from '../domain/entities/deck'
import type { DeckCopyData } from '../domain/entities/deck-copy'
import type { CardReferenceValidator } from '../domain/repositories/card-reference-validator'
import type {
  DeckRepository,
  ListDecksParams
} from '../domain/repositories/deck-repository'
import { CopyDeckUseCase } from './copy-deck'
import { CreateDeckUseCase, type CreateDeckCommand } from './create-deck'
import { DeleteDeckUseCase } from './delete-deck'
import { GetDeckUseCase } from './get-deck'
import { ListDecksUseCase } from './list-decks'
import { PublishDeckUseCase } from './publish-deck'
import { UpdateDeckUseCase } from './update-deck'

const EXISTING_CARD_IDS = ['card-1', 'card-2', 'card-3']

class FakeCardReferenceValidator implements CardReferenceValidator {
  async assertCardsExist(cardList: DeckCardEntry[]): Promise<void> {
    for (const entry of cardList) {
      if (!EXISTING_CARD_IDS.includes(entry.cardId)) {
        throw new ValidationError(`Carta não encontrada: ${entry.cardId}`)
      }
    }
  }
}

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
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20
    let items = [...this.decks.values()]

    if (params.publicOnly) {
      items = items.filter((d) => d.isPublicViewable)
    }
    if (params.status) items = items.filter((d) => d.status === params.status)
    if (params.ownerId) items = items.filter((d) => d.ownerId === params.ownerId)

    const format = params.format?.toLowerCase()
    if (format) items = items.filter((d) => d.data.format.toLowerCase() === format)

    const search = params.search?.toLowerCase()
    if (search) items = items.filter((d) => d.data.name.toLowerCase().includes(search))

    items.sort((a, b) => b.data.createdAt.getTime() - a.data.createdAt.getTime())

    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total: items.length,
      page,
      pageSize
    }
  }

  async createCopy(data: DeckCopyData): Promise<void> {
    this.copies.push(data)
  }

  copyCount(): number {
    return this.copies.length
  }
}

function actor(role: Role, id = 'user-1'): Actor {
  return { id, role }
}

const member = actor('member')
const otherMember = actor('member', 'user-9')

function setup() {
  const repo = new InMemoryDeckRepository()
  const cards = new FakeCardReferenceValidator()
  const eventBus = new InMemoryEventBus()
  const events: string[] = []
  for (const type of ['deck.created', 'deck.updated', 'deck.published', 'deck.copied']) {
    eventBus.subscribe(type, (event) => {
      events.push(event.type)
    })
  }
  return {
    repo,
    events,
    create: new CreateDeckUseCase(repo, cards, eventBus),
    update: new UpdateDeckUseCase(repo, cards, eventBus),
    publish: new PublishDeckUseCase(repo, eventBus),
    remove: new DeleteDeckUseCase(repo),
    get: new GetDeckUseCase(repo),
    list: new ListDecksUseCase(repo),
    copy: new CopyDeckUseCase(repo, eventBus)
  }
}

function createCommand(overrides: Partial<CreateDeckCommand['input']> = {}): CreateDeckCommand {
  return {
    actor: member,
    input: {
      name: 'Deck Agumon Rush',
      format: 'Standard',
      cardList: [
        { cardId: 'card-1', quantity: 4 },
        { cardId: 'card-2', quantity: 2 }
      ],
      ...overrides
    }
  }
}

describe('CreateDeckUseCase', () => {
  it('Member publica deck próprio direto (status published) e emite deck.created', async () => {
    const { create, repo, events } = setup()
    const result = await create.execute(createCommand({ status: 'published' }))

    expect(result.slug).toBe('deck-agumon-rush')
    const deck = await repo.findBySlug(result.slug)
    expect(deck?.status).toBe('published')
    expect(deck?.ownerId).toBe(member.id)
    expect(deck?.isPublicViewable).toBe(true)
    expect(deck?.data.cardList).toEqual([
      { cardId: 'card-1', quantity: 4 },
      { cardId: 'card-2', quantity: 2 }
    ])
    expect(events).toEqual(['deck.created'])
  })

  it('cria como rascunho por padrão (draft, não público)', async () => {
    const { create, repo } = setup()
    const result = await create.execute(createCommand())

    const deck = await repo.findBySlug(result.slug)
    expect(deck?.status).toBe('draft')
    expect(deck?.isPublicViewable).toBe(false)
  })

  it('rejeita cardList com carta inexistente (ValidationError)', async () => {
    const { create } = setup()
    await expect(
      create.execute(createCommand({ cardList: [{ cardId: 'card-999', quantity: 1 }] }))
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejeita publicar deck vazio (ValidationError)', async () => {
    const { create } = setup()
    await expect(create.execute(createCommand({ status: 'published', cardList: [] }))).rejects.toBeInstanceOf(
      ValidationError
    )
  })

  it('rejeita slug duplicado com ConflictError', async () => {
    const { create } = setup()
    await create.execute(createCommand({ slug: 'meu-deck' }))
    await expect(create.execute(createCommand({ slug: 'meu-deck' }))).rejects.toBeInstanceOf(
      ConflictError
    )
  })
})

describe('Edição e exclusão — dono vs outros Members', () => {
  it('dono edita e publica; eventos são publicados', async () => {
    const { create, update, publish, repo, events } = setup()
    const created = await create.execute(createCommand())

    await update.execute({ actor: member, slug: created.slug, input: { name: 'Deck Renomeado' } })
    expect((await repo.findBySlug(created.slug))?.data.name).toBe('Deck Renomeado')

    await publish.execute({ actor: member, slug: created.slug })
    expect((await repo.findBySlug(created.slug))?.status).toBe('published')
    expect(events).toEqual(['deck.created', 'deck.updated', 'deck.published'])
  })

  it('publicar exige ao menos uma carta', async () => {
    const { create, publish } = setup()
    const created = await create.execute(createCommand({ cardList: [] }))

    await expect(publish.execute({ actor: member, slug: created.slug })).rejects.toBeInstanceOf(
      ValidationError
    )
  })

  it('Member NÃO edita deck de outro (ForbiddenError)', async () => {
    const { create, update } = setup()
    const created = await create.execute(createCommand())

    await expect(
      update.execute({ actor: otherMember, slug: created.slug, input: { name: 'Deck do invasor' } })
    ).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('Member NÃO publica deck de outro (ForbiddenError)', async () => {
    const { create, publish } = setup()
    const created = await create.execute(createCommand())

    await expect(
      publish.execute({ actor: otherMember, slug: created.slug })
    ).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('Member NÃO deleta deck de outro (ForbiddenError)', async () => {
    const { create, remove } = setup()
    const created = await create.execute(createCommand())

    await expect(remove.execute({ actor: otherMember, slug: created.slug })).rejects.toBeInstanceOf(
      ForbiddenError
    )
  })

  it('Admin deleta deck de outro usuário (override de dono no domínio)', async () => {
    const { create, remove, repo } = setup()
    const created = await create.execute(createCommand())
    const admin = actor('administrator', 'user-admin')

    const result = await remove.execute({ actor: admin, slug: created.slug })
    expect(result.deleted).toBe(true)
    expect(await repo.findBySlug(created.slug)).toBeNull()
  })

  it('Editor também deleta deck de outro usuário (override de dono no domínio)', async () => {
    const { create, remove, repo } = setup()
    const created = await create.execute(createCommand())
    const editor = actor('editor', 'user-editor')

    const result = await remove.execute({ actor: editor, slug: created.slug })
    expect(result.deleted).toBe(true)
    expect(await repo.findBySlug(created.slug)).toBeNull()
  })

  it('dono deleta deck próprio', async () => {
    const { create, remove, repo } = setup()
    const created = await create.execute(createCommand())

    const result = await remove.execute({ actor: member, slug: created.slug })
    expect(result.deleted).toBe(true)
    expect(await repo.findBySlug(created.slug)).toBeNull()
  })

  it('edição de deck inexistente lança NotFoundError', async () => {
    const { update } = setup()
    await expect(
      update.execute({ actor: member, slug: 'nao-existe', input: { name: 'Deck válido' } })
    ).rejects.toBeInstanceOf(NotFoundError)
  })
})

describe('CopyDeckUseCase — copiar deck de outro vira deck próprio', () => {
  it('cria novo deck do copiador (rascunho) e registra DeckCopy', async () => {
    const { create, copy, repo } = setup()
    const created = await create.execute(createCommand({ status: 'published' }))
    const original = await repo.findBySlug(created.slug)

    const result = await copy.execute({ actor: otherMember, slug: created.slug })

    const copied = await repo.findBySlug(result.slug)
    expect(copied?.ownerId).toBe(otherMember.id)
    expect(copied?.status).toBe('draft')
    expect(copied?.data.cardList).toEqual(original?.data.cardList)
    expect(repo.copyCount()).toBe(1)
  })

  it('emite deck.copied', async () => {
    const { create, copy, events } = setup()
    const created = await create.execute(createCommand({ status: 'published' }))

    await copy.execute({ actor: otherMember, slug: created.slug })
    expect(events).toEqual(['deck.created', 'deck.copied'])
  })

  it('não permite copiar rascunho de outro (NotFoundError sem vazar)', async () => {
    const { create, copy } = setup()
    const created = await create.execute(createCommand())

    await expect(copy.execute({ actor: otherMember, slug: created.slug })).rejects.toBeInstanceOf(
      NotFoundError
    )
  })

  it('gera slug único quando o nome da cópia colide', async () => {
    const { create, copy, repo } = setup()
    const created = await create.execute(createCommand({ status: 'published' }))
    await copy.execute({ actor: otherMember, slug: created.slug })

    const second = await copy.execute({ actor: otherMember, slug: created.slug })
    expect(second.slug).toBe('deck-agumon-rush-copia-2')
    expect(await repo.findBySlug('deck-agumon-rush-copia')).not.toBeNull()
    expect(await repo.findBySlug('deck-agumon-rush-copia-2')).not.toBeNull()
  })
})

describe('ListDecksUseCase — rascunho não aparece na listagem pública', () => {
  async function seed() {
    const ctx = setup()
    await ctx.create.execute(createCommand({ name: 'Deck Público SP', status: 'published' }))
    await ctx.create.execute(createCommand({ name: 'Deck Rascunho SP', cardList: [] }))
    await ctx.create.execute(
      createCommand({ name: 'Deck Unlisted', status: 'published', isPublic: false })
    )
    return ctx
  }

  it('público só vê published E isPublic (nunca rascunhos)', async () => {
    const { list } = await seed()
    const result = await list.execute({ input: {} })
    expect(result.items.map((d) => d.data.name)).toEqual(['Deck Público SP'])
  })

  it('filtra por formato e busca por nome', async () => {
    const { list } = await seed()
    const byFormat = await list.execute({ input: { format: 'Standard' } })
    expect(byFormat.total).toBe(1)

    const bySearch = await list.execute({ input: { search: 'Público' } })
    expect(bySearch.items.map((d) => d.data.name)).toEqual(['Deck Público SP'])
  })

  it('mine lista os decks do próprio ator em qualquer status', async () => {
    const { list } = await seed()
    const mine = await list.execute({ input: {}, actor: member, mine: true })
    expect(mine.total).toBe(3)

    const other = await list.execute({ input: {}, actor: otherMember, mine: true })
    expect(other.total).toBe(0)
  })

  it('admin vê todos os decks (rascunhos + published + unlisted)', async () => {
    const { list } = await seed()
    const admin = actor('administrator', 'user-admin')

    const result = await list.execute({ input: {}, actor: admin })
    expect(result.total).toBe(3)
    expect(result.items.map((d) => d.data.name).sort()).toEqual(
      ['Deck Público SP', 'Deck Rascunho SP', 'Deck Unlisted'].sort()
    )
  })

  it('editor vê todos os decks e pode filtrar por status', async () => {
    const { list } = await seed()
    const editor = actor('editor', 'user-editor')

    const all = await list.execute({ input: {}, actor: editor })
    expect(all.total).toBe(3)

    const drafts = await list.execute({ input: { status: 'draft' }, actor: editor })
    expect(drafts.items.map((d) => d.data.name)).toEqual(['Deck Rascunho SP'])
  })
})

describe('GetDeckUseCase — leitura pública', () => {
  it('público lê deck published E isPublic', async () => {
    const { create, get } = setup()
    const created = await create.execute(createCommand({ status: 'published' }))
    expect((await get.execute({ slug: created.slug })).status).toBe('published')
  })

  it('rascunho é visível só ao dono (NotFound para público e outros)', async () => {
    const { create, get } = setup()
    const created = await create.execute(createCommand())

    await expect(get.execute({ slug: created.slug })).rejects.toBeInstanceOf(NotFoundError)
    await expect(get.execute({ slug: created.slug, actor: otherMember })).rejects.toBeInstanceOf(
      NotFoundError
    )
    await expect(get.execute({ slug: created.slug, actor: member })).resolves.toBeDefined()
  })

  it('deck unlisted (isPublic false) não é lido pelo público', async () => {
    const { create, get } = setup()
    const created = await create.execute(createCommand({ status: 'published', isPublic: false }))

    await expect(get.execute({ slug: created.slug })).rejects.toBeInstanceOf(NotFoundError)
    await expect(get.execute({ slug: created.slug, actor: member })).resolves.toBeDefined()
  })
})
