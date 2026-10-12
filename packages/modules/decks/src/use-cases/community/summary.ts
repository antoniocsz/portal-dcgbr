// Path: packages/modules/decks/src/use-cases/community/summary.ts
// Mapeia o record do repositório (entidade + join com o autor) para os read
// models do feed/detalhe. A legalidade é re-julgada na leitura e injetada aqui.
import type {
  CommunityDeck,
  CommunityDeckSummary
} from '../../domain/community/community-types'
import type { PublicDeckRecord } from '../../domain/repositories/public-deck-repository'

export function toCommunitySummary(
  record: PublicDeckRecord,
  legal: boolean
): CommunityDeckSummary {
  const d = record.deck.data
  return {
    id: d.id,
    name: d.name,
    ownerId: d.accountId,
    ownerName: record.ownerName,
    colors: [...d.colors],
    coverCardId: d.coverCardId,
    likeCount: d.likeCount,
    copyCount: d.copyCount,
    likedByMe: record.likedByMe,
    legal,
    status: d.status,
    publishedAt: d.publishedAt,
    updatedAt: d.updatedAt
  }
}

export function toCommunityDeck(record: PublicDeckRecord, legal: boolean): CommunityDeck {
  const d = record.deck.data
  return {
    ...toCommunitySummary(record, legal),
    cardList: d.cardList.map((entry) => ({ ...entry })),
    eggList: d.eggList.map((entry) => ({ ...entry }))
  }
}
