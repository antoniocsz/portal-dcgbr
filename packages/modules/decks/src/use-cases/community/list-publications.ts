// Path: packages/modules/decks/src/use-cases/community/list-publications.ts
// Minhas publicações (public/hidden, sem as despublicadas) + flag `outdated`
// comparando o congelamento do snapshot com o `updatedAt` do deck de origem.
import type { Actor } from '../../domain/actor'
import type { CommunityPublication } from '../../domain/community/community-types'
import type { PublicDeckRepository } from '../../domain/repositories/public-deck-repository'

export interface ListPublicationsCommand {
  actor: Actor
}

export class ListPublicationsUseCase {
  constructor(private readonly publicDecks: PublicDeckRepository) {}

  async execute(command: ListPublicationsCommand): Promise<CommunityPublication[]> {
    const records = await this.publicDecks.publications(command.actor.id)
    return records.map((record) => ({
      id: record.deck.id,
      sourceDeckId: record.deck.sourceDeckId,
      name: record.deck.data.name,
      likeCount: record.deck.data.likeCount,
      outdated: record.deck.isOutdated(record.sourceUpdatedAt),
      status: record.deck.status
    }))
  }
}
