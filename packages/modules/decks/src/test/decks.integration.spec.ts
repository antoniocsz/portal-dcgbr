// Path: packages/modules/decks/src/test/decks.integration.spec.ts
// Testes de INTEGRAÇÃO do @digimon/decks contra um Postgres real: CRUD de deck
// com eggList/coverCardId (JSON/null) e os caminhos com SQL/transação da
// comunidade (snapshot, like/unlike e cópia).
//
// Gated por TEST_DATABASE_URL — sem a env a suíte é PULADA (CI sem DB segue
// verde). Ver o cabeçalho de `./integration-db.ts` para o passo a passo.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { PrismaClient } from '@digimon/database'
import { Deck, type DeckData } from '../domain/entities/deck'
import { PublicDeck } from '../domain/entities/public-deck'
import { PrismaDeckRepository } from '../infra/repositories/prisma-deck-repository'
import { PrismaPublicDeckRepository } from '../infra/repositories/prisma-public-deck-repository'
import { createTestPrisma, hasTestDatabase, truncateTables } from './integration-db'

const TABLES = [
  'public_deck_likes',
  'public_deck_copies',
  'public_decks',
  'deck_copies',
  'decks',
  'User'
]

function buildDeck(ownerId: string, overrides: Partial<DeckData> = {}): Deck {
  return Deck.create({
    id: overrides.id ?? 'deck-1',
    slug: overrides.slug ?? 'deck-1',
    name: overrides.name ?? 'Deck 1',
    ownerId,
    description: overrides.description ?? null,
    cardList: overrides.cardList ?? [{ cardId: 'card-1', quantity: 4 }],
    eggList: overrides.eggList ?? [],
    coverCardId: overrides.coverCardId ?? null,
    format: overrides.format ?? 'standard',
    status: overrides.status ?? 'draft',
    isPublic: overrides.isPublic ?? true
  })
}

describe.skipIf(!hasTestDatabase)('@digimon/decks — integração Postgres', () => {
  let prisma: PrismaClient
  let decks: PrismaDeckRepository
  let publications: PrismaPublicDeckRepository

  beforeAll(() => {
    prisma = createTestPrisma()
    decks = new PrismaDeckRepository(prisma)
    publications = new PrismaPublicDeckRepository(prisma)
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await truncateTables(prisma, TABLES)
  })

  async function makeUser(id: string, name: string = id): Promise<void> {
    await prisma.user.create({
      data: { id, email: `${id}@test.dev`, name, passwordHash: 'hash' }
    })
  }

  // Publica um snapshot do deck `src-1` (dono `owner-1`) — base dos testes da
  // comunidade, que exigem as FKs de User (autor) e Deck (origem).
  async function seedPublication(): Promise<PublicDeck> {
    await makeUser('owner-1', 'Deck Owner')
    const deck = buildDeck('owner-1', {
      id: 'src-1',
      slug: 'src-1',
      name: 'Source Deck',
      status: 'published'
    })
    await decks.create(deck.data)
    const publication = PublicDeck.fromSource(deck, 'owner-1', {
      colors: ['red', 'blue'],
      legal: true
    })
    await publications.create(publication.data)
    return publication
  }

  describe('PrismaDeckRepository — CRUD + eggList/coverCardId', () => {
    it('cria e lê deck com cardList/eggList (JSON) e coverCardId', async () => {
      await makeUser('owner-1')
      const deck = buildDeck('owner-1', {
        eggList: [{ cardId: 'egg-1', quantity: 2 }],
        coverCardId: 'card-1'
      })
      await decks.create(deck.data)

      const found = await decks.findBySlug('deck-1')
      expect(found?.data.cardList).toEqual([{ cardId: 'card-1', quantity: 4 }])
      expect(found?.data.eggList).toEqual([{ cardId: 'egg-1', quantity: 2 }])
      expect(found?.data.coverCardId).toBe('card-1')
    })

    it('persiste coverCardId e permite voltar para null', async () => {
      await makeUser('owner-1')
      const deck = buildDeck('owner-1', { coverCardId: 'card-9' })
      await decks.create(deck.data)
      expect((await decks.findById('deck-1'))?.data.coverCardId).toBe('card-9')

      deck.update({ coverCardId: null })
      await decks.update(deck)
      expect((await decks.findById('deck-1'))?.data.coverCardId).toBeNull()
    })

    it('update altera cardList/status e delete remove a linha', async () => {
      await makeUser('owner-1')
      const deck = buildDeck('owner-1')
      await decks.create(deck.data)

      deck.publish()
      deck.update({ cardList: [{ cardId: 'card-2', quantity: 3 }] })
      await decks.update(deck)

      const updated = await decks.findById('deck-1')
      expect(updated?.status).toBe('published')
      expect(updated?.data.cardList).toEqual([{ cardId: 'card-2', quantity: 3 }])

      await decks.delete('deck-1')
      expect(await decks.findById('deck-1')).toBeNull()
    })

    it('list filtra por publicOnly/ownerId e busca full-text no nome', async () => {
      await makeUser('owner-1')
      await makeUser('owner-2')
      const published = buildDeck('owner-1', {
        id: 'd-pub',
        slug: 'd-pub',
        name: 'Agumon Rush',
        status: 'published'
      })
      const draft = buildDeck('owner-1', {
        id: 'd-draft',
        slug: 'd-draft',
        name: 'Draft Only'
      })
      const unlisted = buildDeck('owner-2', {
        id: 'd-unlisted',
        slug: 'd-unlisted',
        name: 'Gabumon Control',
        status: 'published'
      })
      unlisted.update({ isPublic: false })
      await decks.create(published.data)
      await decks.create(draft.data)
      await decks.create(unlisted.data)

      const publicOnly = await decks.list({ publicOnly: true })
      expect(publicOnly.items.map((deck) => deck.id)).toEqual(['d-pub'])

      const byOwner = await decks.list({ ownerId: 'owner-1' })
      expect(byOwner.items.map((deck) => deck.id).sort()).toEqual(['d-draft', 'd-pub'])

      const search = await decks.list({ search: 'gabumon' })
      expect(search.items.map((deck) => deck.id)).toEqual(['d-unlisted'])
    })
  })

  describe('PrismaPublicDeckRepository — comunidade (SQL/transação)', () => {
    it('snapshot: create + findById (autor) + findBySourceDeck', async () => {
      const publication = await seedPublication()

      const record = await publications.findById(publication.id)
      expect(record?.ownerName).toBe('Deck Owner')
      expect(record?.likedByMe).toBe(false)
      expect(record?.deck.data.colors).toEqual(['red', 'blue'])
      expect(record?.deck.data.cardList).toEqual([{ cardId: 'card-1', quantity: 4 }])

      const bySource = await publications.findBySourceDeck('owner-1', 'src-1')
      expect(bySource?.id).toBe(publication.id)
    })

    it('like/unlike atualiza o contador de forma idempotente', async () => {
      const publication = await seedPublication()
      await makeUser('user-2')

      expect(await publications.like(publication.id, 'user-2')).toEqual({
        created: true,
        likeCount: 1
      })
      expect(await publications.like(publication.id, 'user-2')).toEqual({
        created: false,
        likeCount: 1
      })

      const record = await publications.findById(publication.id, 'user-2')
      expect(record?.likedByMe).toBe(true)

      expect(await publications.unlike(publication.id, 'user-2')).toEqual({
        removed: true,
        likeCount: 0
      })
      expect(await publications.unlike(publication.id, 'user-2')).toEqual({
        removed: false,
        likeCount: 0
      })
    })

    it('addCopy conta 1 cópia por conta', async () => {
      const publication = await seedPublication()
      await makeUser('user-2')
      await makeUser('user-3')

      expect(await publications.addCopy(publication.id, 'user-2')).toEqual({
        created: true,
        copyCount: 1
      })
      expect(await publications.addCopy(publication.id, 'user-2')).toEqual({
        created: false,
        copyCount: 1
      })
      expect(await publications.addCopy(publication.id, 'user-3')).toEqual({
        created: true,
        copyCount: 2
      })
    })
  })
})
