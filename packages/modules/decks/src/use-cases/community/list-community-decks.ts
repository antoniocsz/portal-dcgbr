// Path: packages/modules/decks/src/use-cases/community/list-community-decks.ts
// Feed público: filtro por status=public, cores, busca (nome/autor), ordenação
// `top` (curtidas recentes por período quando period != all) | `new`, paginação
// por página (pageSize=24) SEM COUNT total. Legalidade re-julgada na leitura.
import type { Actor } from '../../domain/actor'
import type {
  CommunityDeckPage,
  CommunityDeckSummary,
  CommunityPeriod
} from '../../domain/community/community-types'
import type {
  ListPublicDecksQuery,
  PublicDeckRepository
} from '../../domain/repositories/public-deck-repository'
import { CheckDeckLegalityUseCase } from '../check-deck-legality'
import { listCommunityDecksSchema, type ListCommunityDecksInput } from './schemas'
import { toCommunitySummary } from './summary'

export const COMMUNITY_PAGE_SIZE = 24

export interface ListCommunityDecksCommand {
  input: ListCommunityDecksInput
  actor?: Actor | null
}

export class ListCommunityDecksUseCase {
  constructor(
    private readonly publicDecks: PublicDeckRepository,
    private readonly legality: CheckDeckLegalityUseCase
  ) {}

  async execute(command: ListCommunityDecksCommand): Promise<CommunityDeckPage> {
    const parsed = listCommunityDecksSchema.parse(command.input)
    const sort = parsed.sort ?? 'top'
    const period = parsed.period ?? 'all'
    const page = parsed.page ?? 1
    const pageSize = parsed.pageSize ?? COMMUNITY_PAGE_SIZE

    const query: ListPublicDecksQuery = { status: 'public', sort, page, pageSize }
    if (parsed.colors && parsed.colors.length > 0) query.colors = parsed.colors
    if (parsed.search) query.search = parsed.search
    if (command.actor) query.viewerId = command.actor.id
    if (sort === 'top' && period !== 'all') query.since = periodStart(period)

    const result = await this.publicDecks.list(query)
    const items: CommunityDeckSummary[] = []
    for (const record of result.items) {
      const legality = await this.legality.execute({
        cardList: record.deck.data.cardList,
        eggList: record.deck.data.eggList
      })
      items.push(toCommunitySummary(record, legality.legal))
    }

    return { items, page, pageSize, hasMore: result.hasMore }
  }
}

/** Início da janela de curtidas recentes (semana = 7 dias; mês = 30 dias). */
function periodStart(period: CommunityPeriod, now: Date = new Date()): Date {
  const days = period === 'week' ? 7 : 30
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
}
