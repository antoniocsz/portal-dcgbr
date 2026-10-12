// Path: packages/modules/cards/src/use-cases/import-cards-from-source.spec.ts
// Critérios: mapper (tipos Digimon/Tamer/Digi-Egg/Digimon-Option, tipo desconhecido
// ignorado, "All" expandido, Lv.4→4, imageUrl/setCode, "-" virando vazio), derivação
// de sets a partir de `notes` (code/name, dedupe, fallback) e use case com provider
// fake (filtro por set/ids/max, skipped, população de card_sets). Sem rede.
import { describe, expect, it } from 'vitest'
import { ForbiddenError, InMemoryEventBus } from '@digimon/contracts'
import type { CardActor } from '../domain/actor'
import type { CardSourceProvider, RawSourceCard } from '../domain/sources/card-source-provider'
import { mapTakaCard, type TakaCardRecord } from '../domain/sources/taka/taka-card-mapper'
import { deriveTakaSets, parseTakaSetNotes } from '../domain/sources/taka/taka-set-derivation'
import { MemoryCardRepository, MemoryCardSetRepository } from '../test/memory-card-repository'
import { ImportCardsUseCase } from './import-cards'
import { ImportCardsFromSourceUseCase } from './import-cards-from-source'

const admin: CardActor = { id: 'admin-1', role: 'administrator' }
const member: CardActor = { id: 'member-1', role: 'member' }

function record(overrides: Partial<TakaCardRecord> = {}): TakaCardRecord {
  return {
    cardNumber: 'BT1-001',
    cardType: 'Digimon',
    color: 'Red',
    cardLv: 'Lv.4',
    dp: '5000',
    playCost: '5',
    rarity: 'R',
    attribute: 'Vaccine',
    type: 'Dinosaur',
    effect: '-',
    digivolveEffect: '-',
    securityEffect: '-',
    name: { english: 'Greymon' },
    digivolveCondition: [],
    ...overrides
  }
}

class FakeSourceProvider implements CardSourceProvider {
  constructor(private readonly records: RawSourceCard[]) {}

  async fetchCatalog(): Promise<RawSourceCard[]> {
    return this.records
  }
}

function setup(records: RawSourceCard[]) {
  const repo = new MemoryCardRepository()
  const sets = new MemoryCardSetRepository()
  const importer = new ImportCardsUseCase(repo, sets, new InMemoryEventBus())
  const useCase = new ImportCardsFromSourceUseCase(importer, new FakeSourceProvider(records))
  return { repo, sets, useCase }
}

describe('mapTakaCard — mapper da fonte TakaOtaku', () => {
  it('mapeia um Digimon (limpa NBSP, concatena efeitos, Lv.4→4, imageUrl/setCode)', () => {
    const mapped = mapTakaCard(
      record({
        name: { english: 'Greymon\u00a0X' },
        effect: 'A\nB',
        digivolveEffect: 'C',
        securityEffect: '-'
      })
    )

    expect(mapped).not.toBeNull()
    expect(mapped).toMatchObject({
      dcgId: 'BT1-001',
      number: 'BT1-001',
      name: 'Greymon X',
      type: 'digimon',
      rarity: 'R',
      colors: ['red'],
      level: 4,
      digiType: 'Dinosaur',
      attribute: 'Vaccine',
      dp: 5000,
      playCost: 5,
      setCode: 'BT1',
      releaseDate: null
    })
    expect(mapped?.effects).toBe('A\nB\n\nC')
    expect(mapped?.imageUrl).toBe(
      'https://world.digimoncard.com/images/cardlist/card/BT1-001.png'
    )
  })

  it('mapeia cores múltiplas e placeholders "-" como ausentes', () => {
    const mapped = mapTakaCard(
      record({
        cardNumber: 'EX13-072',
        color: 'Black/Yellow',
        cardLv: '-',
        dp: '-',
        playCost: '-',
        attribute: '-',
        type: '-',
        effect: '-',
        digivolveEffect: '-',
        securityEffect: '-'
      })
    )

    expect(mapped?.colors).toEqual(['black', 'yellow'])
    expect(mapped?.level).toBeNull()
    expect(mapped?.dp).toBeNull()
    expect(mapped?.playCost).toBeNull()
    expect(mapped?.attribute).toBeNull()
    expect(mapped?.digiType).toBeNull()
    expect(mapped?.effects).toBeNull()
    expect(mapped?.setCode).toBe('EX13')
  })

  it('mapeia Tamer, Digi-Egg e Digimon/Option para os tipos do domínio', () => {
    expect(mapTakaCard(record({ cardType: 'Tamer' }))?.type).toBe('tamer')
    expect(mapTakaCard(record({ cardType: 'Digi-Egg' }))?.type).toBe('digiegg')
    expect(mapTakaCard(record({ cardType: 'Digimon/Option' }))?.type).toBe('digimon')
  })

  it('ignora (null) tipo desconhecido ou sem número/nome', () => {
    expect(mapTakaCard(record({ cardType: 'Unknown' }))).toBeNull()
    expect(mapTakaCard(record({ cardNumber: '' }))).toBeNull()
    expect(mapTakaCard(record({ name: { english: '-' } }))).toBeNull()
  })

  it('expande color "All" para as 7 cores e descarta níveis não numéricos', () => {
    const mapped = mapTakaCard(
      record({
        digivolveCondition: [
          { color: 'All', level: '4', cost: '2' },
          { color: 'Blue', level: '3', cost: '-' },
          { color: 'Red', level: 'Ult.', cost: '5' }
        ]
      })
    )

    const conditions = mapped?.evolutionConditions ?? []
    expect(conditions.filter((c) => c.cost === 2)).toHaveLength(7)
    expect(conditions.some((c) => c.color === 'blue' && c.level === 3 && c.cost === 0)).toBe(true)
    expect(conditions.some((c) => c.level === 4 && c.color === 'white')).toBe(true)
    expect(conditions).toHaveLength(8)
  })
})

describe('derivação de sets (parseTakaSetNotes / deriveTakaSets)', () => {
  it('extrai code/name dos formatos "<CODE>: <NOME>" e "<NOME> [<CODE>]"', () => {
    expect(parseTakaSetNotes('AD-01: ADVANCED BOOSTER DIGIMON GENERATION')).toEqual({
      code: 'AD-01',
      name: 'ADVANCED BOOSTER DIGIMON GENERATION'
    })
    expect(parseTakaSetNotes('▹BOOSTER BATTLE OF OMNI [BT-05]')).toEqual({
      code: 'BT-05',
      name: 'BOOSTER BATTLE OF OMNI'
    })
  })

  it('ignora notes livres/promo sem código parseável', () => {
    expect(parseTakaSetNotes('Demo Deck: Black')).toBeNull()
    expect(parseTakaSetNotes('Official Tournament Pack Vol. 1')).toBeNull()
    expect(parseTakaSetNotes('-')).toBeNull()
    expect(parseTakaSetNotes(undefined)).toBeNull()
  })

  it('usa o setCode como code, deduplica e cai no nome = setCode sem notes válida', () => {
    const sets = deriveTakaSets([
      { setCode: 'BT5', notes: 'BOOSTER BATTLE OF OMNI [BT-05]' },
      { setCode: 'BT5', notes: 'BT-05: Booster Battle Of Omni' },
      // nota de outra expansão não deve renomear o grupo de promos "P"
      { setCode: 'P', notes: '▹BOOSTER NEXT ADVENTURE [BT-07]' },
      { setCode: 'AD1', notes: 'AD-01: ADVANCED BOOSTER DIGIMON GENERATION' }
    ])

    expect(sets).toEqual([
      { code: 'AD1', name: 'ADVANCED BOOSTER DIGIMON GENERATION', releaseDate: null },
      { code: 'BT5', name: 'BOOSTER BATTLE OF OMNI', releaseDate: null },
      { code: 'P', name: 'P', releaseDate: null }
    ])
  })
})

describe('ImportCardsFromSourceUseCase', () => {
  const fixtures: RawSourceCard[] = [
    record({ cardNumber: 'BT1-001', name: { english: 'Agumon' } }),
    record({ cardNumber: 'BT2-001', name: { english: 'Gabumon' } }),
    record({ cardNumber: 'ST1-01', cardType: 'Tamer', name: { english: 'Tai' } }),
    record({ cardNumber: 'XX-1', cardType: 'Unknown', name: { english: 'Desconhecida' } })
  ]

  it('importa as cartas mapeadas e conta skipped do tipo desconhecido', async () => {
    const app = setup(fixtures)

    const result = await app.useCase.execute({ actor: admin })

    expect(result).toMatchObject({ imported: 3, updated: 0, skipped: 1 })
    expect(result.sets).toEqual(['BT1', 'BT2', 'ST1'])
  })

  it('popula card_sets a partir de notes (upsert por code), com name e contagem', async () => {
    const withNotes: RawSourceCard[] = [
      record({ cardNumber: 'BT5-001', notes: 'BOOSTER BATTLE OF OMNI [BT-05]' }),
      record({ cardNumber: 'BT5-002', notes: 'BOOSTER BATTLE OF OMNI [BT-05]' }),
      record({ cardNumber: 'AD1-001', notes: 'AD-01: ADVANCED BOOSTER DIGIMON GENERATION' }),
      // sem notes: cai no fallback name = setCode
      record({ cardNumber: 'P-001' })
    ]
    const app = setup(withNotes)

    const result = await app.useCase.execute({ actor: admin })

    expect(result).toMatchObject({ imported: 4, sets: ['AD1', 'BT5', 'P'], setsCount: 3 })
    const persisted = (await app.sets.list())
      .map((set) => ({ code: set.code, name: set.name }))
      .sort((a, b) => a.code.localeCompare(b.code))
    expect(persisted).toEqual([
      { code: 'AD1', name: 'ADVANCED BOOSTER DIGIMON GENERATION' },
      { code: 'BT5', name: 'BOOSTER BATTLE OF OMNI' },
      { code: 'P', name: 'P' }
    ])
  })

  it('reimportar atualiza as cartas existentes', async () => {
    const app = setup(fixtures)
    await app.useCase.execute({ actor: admin })

    const result = await app.useCase.execute({ actor: admin })

    expect(result).toMatchObject({ imported: 0, updated: 3, skipped: 1 })
  })

  it('filtra por set (sets) sem contar os filtrados como skipped', async () => {
    const app = setup(fixtures)

    const result = await app.useCase.execute({ actor: admin, sets: ['bt1'] })

    expect(result).toMatchObject({ imported: 1, skipped: 1, sets: ['BT1'] })
  })

  it('filtra por ids e respeita max', async () => {
    const byId = setup(fixtures)
    const idResult = await byId.useCase.execute({ actor: admin, ids: ['BT2-001'] })
    expect(idResult).toMatchObject({ imported: 1, skipped: 1 })

    const limited = setup(fixtures)
    const maxResult = await limited.useCase.execute({ actor: admin, max: 2 })
    expect(maxResult.imported).toBe(2)
  })

  it('exige curador (ForbiddenError para member)', async () => {
    const app = setup(fixtures)
    await expect(app.useCase.execute({ actor: member })).rejects.toBeInstanceOf(ForbiddenError)
  })
})
