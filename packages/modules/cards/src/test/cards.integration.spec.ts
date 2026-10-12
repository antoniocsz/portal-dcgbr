// Path: packages/modules/cards/src/test/cards.integration.spec.ts
// Testes de INTEGRAÇÃO do @digimon/cards contra um Postgres real: full-text
// (to_tsvector/plainto_tsquery + índice GIN cards_search_idx), filtros
// combinados, faixa de custo (task 82) e upsert (dcgId / card_sets).
//
// Gated por TEST_DATABASE_URL — sem a env a suíte é PULADA (CI sem DB segue
// verde). Ver o cabeçalho de `./integration-db.ts` para o passo a passo.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { PrismaClient } from '@digimon/database'
import { Card, type CardColor, type CardInputData } from '../domain/entities/card'
import { CardSet } from '../domain/entities/card-set'
import { PrismaCardRepository } from '../infra/repositories/prisma-card-repository'
import { PrismaCardSetRepository } from '../infra/repositories/prisma-card-set-repository'
import { createTestPrisma, hasTestDatabase, truncateTables } from './integration-db'

const TABLES = ['cards', 'card_sets']

type CardOverrides = Partial<
  Pick<CardInputData, 'type' | 'colors' | 'playCost' | 'setCode' | 'effects'>
>

function makeCard(
  id: string,
  dcgId: string,
  name: string,
  number: string,
  overrides: CardOverrides = {}
): Card {
  return Card.create({
    id,
    dcgId,
    name,
    number,
    rarity: 'C',
    type: overrides.type ?? 'digimon',
    colors: overrides.colors ?? (['red'] as CardColor[]),
    playCost: overrides.playCost ?? null,
    setCode: overrides.setCode ?? null,
    effects: overrides.effects ?? null
  })
}

describe.skipIf(!hasTestDatabase)('@digimon/cards — integração Postgres', () => {
  let prisma: PrismaClient
  let cards: PrismaCardRepository
  let sets: PrismaCardSetRepository

  beforeAll(() => {
    prisma = createTestPrisma()
    cards = new PrismaCardRepository(prisma)
    sets = new PrismaCardSetRepository(prisma)
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await truncateTables(prisma, TABLES)
  })

  // Catálogo cobrindo nome/efeito distintos, tipos/cores/sets variados e
  // playCost null (Digi-Egg) — exercita full-text e filtros/faixa.
  async function seedCatalog(): Promise<void> {
    await cards.create(
      makeCard('card-agumon', 'DCG-001', 'Agumon', 'BT1-001', { setCode: 'BT1', playCost: 3 })
    )
    await cards.create(
      makeCard('card-greymon', 'DCG-002', 'Greymon', 'BT1-002', {
        setCode: 'BT1',
        playCost: 5,
        effects: 'When Digivolving, delete 1 of your opponent Digimon.'
      })
    )
    await cards.create(
      makeCard('card-hammer', 'DCG-003', 'Hammer Spark', 'BT2-100', {
        type: 'option',
        colors: ['blue'],
        setCode: 'BT2',
        playCost: 2,
        effects: 'Return 1 card to the hand.'
      })
    )
    await cards.create(
      makeCard('card-botamon', 'DCG-004', 'Botamon', 'ST1-01', {
        type: 'digiegg',
        colors: ['black'],
        setCode: 'ST1'
      })
    )
  }

  describe('full-text (to_tsvector/plainto_tsquery + índice GIN)', () => {
    it('mantém o índice GIN cards_search_idx (migration aplicada)', async () => {
      const rows = await prisma.$queryRaw<{ indexname: string }[]>`
        SELECT indexname FROM pg_indexes
        WHERE tablename = 'cards' AND indexname = 'cards_search_idx'
      `
      expect(rows).toHaveLength(1)
    })

    it('encontra por nome', async () => {
      await seedCatalog()
      const result = await cards.search({ search: 'agumon' })
      expect(result.items.map((card) => card.dcgId)).toEqual(['DCG-001'])
      expect(result.total).toBe(1)
    })

    it('encontra por efeito (nome não contém o termo)', async () => {
      await seedCatalog()
      const result = await cards.search({ search: 'digivolving' })
      expect(result.items.map((card) => card.dcgId)).toEqual(['DCG-002'])
    })
  })

  describe('filtros combinados e faixa de custo', () => {
    it('combina tipo + cor + setCode', async () => {
      await seedCatalog()
      const result = await cards.search({ type: 'option', color: 'blue', setCode: 'BT2' })
      expect(result.items.map((card) => card.dcgId)).toEqual(['DCG-003'])
    })

    it('faixa de custo inclui os limites e exclui playCost null', async () => {
      await seedCatalog()
      const result = await cards.search({ minPlayCost: 3, maxPlayCost: 5 })
      expect(result.items.map((card) => card.dcgId).sort()).toEqual(['DCG-001', 'DCG-002'])
    })

    it('custo exato tem precedência sobre a faixa', async () => {
      await seedCatalog()
      const result = await cards.search({ playCost: 2, minPlayCost: 5 })
      expect(result.items.map((card) => card.dcgId)).toEqual(['DCG-003'])
    })
  })

  describe('upsert (import)', () => {
    it('cria e depois atualiza a MESMA linha pelo dcgId', async () => {
      const card = makeCard('card-agumon', 'DCG-001', 'Agumon', 'BT1-001', { playCost: 3 })
      await cards.create(card)
      expect((await cards.findByDcgId('DCG-001'))?.data.name).toBe('Agumon')

      card.update({
        dcgId: 'DCG-001',
        name: 'Agumon Renomeado',
        number: 'BT1-001',
        rarity: 'U',
        type: 'digimon',
        colors: ['red'],
        playCost: 3
      })
      await cards.update(card)

      const updated = await cards.findByDcgId('DCG-001')
      expect(updated?.data.name).toBe('Agumon Renomeado')
      expect(updated?.data.rarity).toBe('U')
      expect(await prisma.card.count()).toBe(1)
    })

    it('card_sets: upsert por code cria e depois atualiza o nome', async () => {
      await sets.upsert(CardSet.create({ id: 'set-1', code: 'bt1', name: 'Booster 1' }))
      const created = await sets.findByCode('BT1')
      expect(created?.data.code).toBe('BT1')
      expect(created?.data.name).toBe('Booster 1')

      await sets.upsert(
        CardSet.create({ id: 'set-2', code: 'BT1', name: 'Booster 1 renomeado' })
      )
      const list = await sets.list()
      expect(list).toHaveLength(1)
      expect(list[0]?.data.name).toBe('Booster 1 renomeado')
    })
  })
})
