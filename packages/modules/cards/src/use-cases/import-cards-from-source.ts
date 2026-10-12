// Path: packages/modules/cards/src/use-cases/import-cards-from-source.ts
// Importação do catálogo a partir de uma fonte externa (DIP): baixa o catálogo,
// mapeia (descartando registros não reconhecidos), filtra por sets/ids/max e
// reusa o `ImportCardsUseCase` (mesmas invariantes de dcgId e reimport). Só admin.
import { requireCurator, type CardActor } from '../domain/actor'
import type { CardSourceProvider } from '../domain/sources/card-source-provider'
import { mapTakaCard, type TakaCardRecord } from '../domain/sources/taka/taka-card-mapper'
import { deriveTakaSets, type TakaSetCandidate } from '../domain/sources/taka/taka-set-derivation'
import type { ImportCardsUseCase } from './import-cards'
import type { CardInput } from './schemas'

export interface ImportCardsFromSourceCommand {
  actor: CardActor | null
  /** Fonte injetável (testes/DIP); por padrão usa a fonte concreta do composition root. */
  source?: CardSourceProvider
  /** Importa apenas cartas cujo set (prefixo do número) está na lista. */
  sets?: string[]
  /** Importa apenas cartas cujo dcgId/número está na lista. */
  ids?: string[]
  /** Limite máximo de cartas importadas (após os filtros). */
  max?: number
}

export interface ImportCardsFromSourceResult {
  imported: number
  updated: number
  /** Registros da fonte descartados no mapeamento (tipo/cor não reconhecidos). */
  skipped: number
  /** Códigos de set distintos das cartas importadas (ordenados). */
  sets: string[]
  /** Quantidade de sets persistidos (`card_sets` upsert por code) na importação. */
  setsCount: number
}

export class ImportCardsFromSourceUseCase {
  constructor(
    private readonly importer: ImportCardsUseCase,
    private readonly defaultSource: CardSourceProvider
  ) {}

  async execute(command: ImportCardsFromSourceCommand): Promise<ImportCardsFromSourceResult> {
    requireCurator(command.actor)

    const source = command.source ?? this.defaultSource
    const records = await source.fetchCatalog()

    const idsFilter = command.ids ? new Set(command.ids.map((id) => id.trim())) : null
    const setsFilter = command.sets
      ? new Set(command.sets.map((set) => set.trim().toUpperCase()))
      : null

    const cards: CardInput[] = []
    const candidates: TakaSetCandidate[] = []
    let skipped = 0

    for (const record of records) {
      if (command.max !== undefined && cards.length >= command.max) break

      // `record` é JSON bruto da fonte; o provider configurado é o TakaOtaku.
      const mapped = mapTakaCard(record as TakaCardRecord)
      if (!mapped) {
        skipped += 1
        continue
      }
      if (idsFilter && !idsFilter.has(mapped.dcgId)) continue
      if (setsFilter && !(mapped.setCode && setsFilter.has(mapped.setCode.toUpperCase()))) continue

      cards.push(mapped)
      if (mapped.setCode) {
        candidates.push({ setCode: mapped.setCode, notes: (record as TakaCardRecord).notes })
      }
    }

    if (cards.length === 0) {
      return { imported: 0, updated: 0, skipped, sets: [], setsCount: 0 }
    }

    // Popula `card_sets` junto com as cartas: nome legível vem de `notes`, código é o `setCode`.
    const sets = deriveTakaSets(candidates)
    const result = await this.importer.execute({ actor: command.actor, input: { cards, sets } })
    return {
      imported: result.imported,
      updated: result.updated,
      skipped,
      sets: sets.map((set) => set.code),
      setsCount: result.sets
    }
  }
}
