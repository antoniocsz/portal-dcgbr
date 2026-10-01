// Path: packages/modules/cards/src/use-cases/cards.spec.ts
// Critérios: busca full-text (nome/efeito); filtros combinados (cor, tipo, custo,
// set); importação rejeita duplicata (dcgId único); leitura pública liberada,
// escrita só admin.
import { describe, expect, it } from 'vitest'
import type { Role } from '@digimon/contracts'
import { ForbiddenError, InMemoryEventBus, NotFoundError, ValidationError } from '@digimon/contracts'
import type { CardActor } from '../domain/actor'
import type { CardInput } from './schemas'
import { MemoryCardRepository, MemoryCardSetRepository } from '../test/memory-card-repository'
import { GetCardUseCase } from './get-card'
import { ImportCardsUseCase } from './import-cards'
import { ListCardsUseCase } from './list-cards'
import { ListSetsUseCase } from './list-sets'

function actor(role: Role, id = 'user-1'): CardActor {
  return { id, role }
}

const admin = actor('administrator')
const editor = actor('editor', 'user-2')
const member = actor('member', 'user-3')

function card(overrides: Partial<CardInput> & { dcgId: string; name: string }): CardInput {
  return {
    number: 'BT1-001',
    rarity: 'C',
    type: 'digimon',
    colors: ['red'],
    level: 3,
    dp: 1000,
    playCost: 3,
    ...overrides
  }
}

function setup() {
  const repo = new MemoryCardRepository()
  const sets = new MemoryCardSetRepository()
  const eventBus = new InMemoryEventBus()
  return {
    repo,
    sets,
    eventBus,
    import: new ImportCardsUseCase(repo, sets, eventBus),
    get: new GetCardUseCase(repo),
    list: new ListCardsUseCase(repo),
    listSets: new ListSetsUseCase(sets)
  }
}

async function seed(app: ReturnType<typeof setup>, cards: CardInput[]) {
  await app.import.execute({ actor: admin, input: { cards } })
}

describe('ImportCardsUseCase — curadoria (escrita só admin)', () => {
  it('admin importa cartas novas e publica card.imported', async () => {
    const app = setup()
    const events: string[] = []
    app.eventBus.subscribe('card.imported', (event) => {
      events.push(event.type)
    })

    const result = await app.import.execute({
      actor: admin,
      input: { cards: [card({ dcgId: 'BT1-001', name: 'Agumon' })] }
    })

    expect(result).toEqual({ imported: 1, updated: 0, sets: 0 })
    expect(events).toEqual(['card.imported'])
  })

  it('rejeita duplicata de dcgId dentro do lote (dcgId único)', async () => {
    const app = setup()
    await expect(
      app.import.execute({
        actor: admin,
        input: {
          cards: [
            card({ dcgId: 'BT1-001', name: 'Agumon' }),
            card({ dcgId: 'BT1-001', name: 'Agumon (duplicado)' })
          ]
        }
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('reimportar dcgId existente atualiza a carta e publica card.updated', async () => {
    const app = setup()
    await seed(app, [card({ dcgId: 'BT1-001', name: 'Agumon' })])

    const events: string[] = []
    app.eventBus.subscribe('card.updated', (event) => {
      events.push(event.type)
    })

    const result = await app.import.execute({
      actor: admin,
      input: { cards: [card({ dcgId: 'BT1-001', name: 'Agumon (atualizado)', dp: 2000 })] }
    })

    expect(result).toEqual({ imported: 0, updated: 1, sets: 0 })
    expect(events).toEqual(['card.updated'])
    const stored = await app.repo.findByDcgId('BT1-001')
    expect(stored?.name).toBe('Agumon (atualizado)')
    expect(stored?.data.dp).toBe(2000)
  })

  it('rejeita escrita de editor e de member (ForbiddenError)', async () => {
    const app = setup()
    await expect(
      app.import.execute({ actor: editor, input: { cards: [card({ dcgId: 'BT1-001', name: 'X' })] } })
    ).rejects.toBeInstanceOf(ForbiddenError)
    await expect(
      app.import.execute({ actor: member, input: { cards: [card({ dcgId: 'BT1-001', name: 'X' })] } })
    ).rejects.toBeInstanceOf(ForbiddenError)
    await expect(
      app.import.execute({ actor: null, input: { cards: [card({ dcgId: 'BT1-001', name: 'X' })] } })
    ).rejects.toBeInstanceOf(ForbiddenError)
  })
})

describe('ListCardsUseCase — leitura pública', () => {
  it('busca full-text por nome e por efeito', async () => {
    const app = setup()
    await seed(app, [
      card({ dcgId: 'BT1-001', name: 'Agumon', number: 'BT1-001', effects: null }),
      card({ dcgId: 'BT1-002', name: 'Gabumon', number: 'BT1-002', effects: 'Ganha +1000 DP.' }),
      card({ dcgId: 'BT1-003', name: 'Palmon', number: 'BT1-003', effects: null })
    ])

    const byName = await app.list.execute({ input: { search: 'agumon' } })
    expect(byName.items.map((c) => c.name)).toEqual(['Agumon'])

    const byEffect = await app.list.execute({ input: { search: '1000 DP' } })
    expect(byEffect.items.map((c) => c.name)).toEqual(['Gabumon'])

    const noMatch = await app.list.execute({ input: { search: 'inexistente' } })
    expect(noMatch.total).toBe(0)
  })

  it('combina filtros de cor, tipo, custo e set', async () => {
    const app = setup()
    await seed(app, [
      card({ dcgId: 'BT1-001', name: 'Agumon', colors: ['red'], type: 'digimon', playCost: 3, setCode: 'BT1' }),
      card({ dcgId: 'BT1-002', name: 'Gabumon', colors: ['blue'], type: 'digimon', playCost: 4, setCode: 'BT1' }),
      card({ dcgId: 'BT2-001', name: 'Greymon', colors: ['red'], type: 'digimon', playCost: 6, setCode: 'BT2' }),
      card({ dcgId: 'BT1-100', name: 'Tamer Vermelho', colors: ['red'], type: 'tamer', playCost: 3, setCode: 'BT1' })
    ])

    const red = await app.list.execute({ input: { color: 'red' } })
    expect(red.total).toBe(3)

    const redDigimonBt1 = await app.list.execute({
      input: { color: 'red', type: 'digimon', setCode: 'BT1' }
    })
    expect(redDigimonBt1.items.map((c) => c.name)).toEqual(['Agumon'])

    const cost3 = await app.list.execute({ input: { playCost: 3 } })
    expect(cost3.total).toBe(2)

    const tamer = await app.list.execute({ input: { type: 'tamer' } })
    expect(tamer.items.map((c) => c.name)).toEqual(['Tamer Vermelho'])
  })

  it('pagina os resultados', async () => {
    const app = setup()
    await seed(app, [
      card({ dcgId: 'BT1-001', name: 'A', number: 'BT1-001' }),
      card({ dcgId: 'BT1-002', name: 'B', number: 'BT1-002' }),
      card({ dcgId: 'BT1-003', name: 'C', number: 'BT1-003' })
    ])

    const first = await app.list.execute({ input: { page: 1, pageSize: 2 } })
    expect(first.items).toHaveLength(2)
    expect(first.total).toBe(3)

    const second = await app.list.execute({ input: { page: 2, pageSize: 2 } })
    expect(second.items).toHaveLength(1)
  })
})

describe('GetCardUseCase — ficha pública', () => {
  it('lê por id e por número', async () => {
    const app = setup()
    await seed(app, [card({ dcgId: 'BT1-001', name: 'Agumon', number: 'BT1-001' })])
    const stored = await app.repo.findByDcgId('BT1-001')
    if (!stored) throw new Error('carta não encontrada no repositório de teste')

    const byId = await app.get.execute({ id: stored.id })
    expect(byId.name).toBe('Agumon')

    const byNumber = await app.get.execute({ number: 'BT1-001' })
    expect(byNumber.dcgId).toBe('BT1-001')
  })

  it('lança NotFoundError para carta inexistente e ValidationError sem id/número', async () => {
    const app = setup()
    await expect(app.get.execute({ id: 'nao-existe' })).rejects.toBeInstanceOf(NotFoundError)
    await expect(app.get.execute({})).rejects.toBeInstanceOf(ValidationError)
  })
})

describe('ListSetsUseCase', () => {
  it('lista séries/expansões importadas', async () => {
    const app = setup()
    await app.import.execute({
      actor: admin,
      input: {
        cards: [card({ dcgId: 'BT1-001', name: 'Agumon', setCode: 'BT1' })],
        sets: [{ code: 'BT1', name: 'Booster Set 1' }]
      }
    })

    const sets = await app.listSets.execute()
    expect(sets.map((set) => set.code)).toEqual(['BT1'])
    expect(sets[0]?.name).toBe('Booster Set 1')
  })
})
