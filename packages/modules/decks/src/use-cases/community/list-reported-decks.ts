// Path: packages/modules/decks/src/use-cases/community/list-reported-decks.ts
// Fila de moderação: publicações com reportes abertos (agrupados). Só
// administrator|editor.
import { requireManager, type Actor } from '../../domain/actor'
import type { ReportedCommunityDeck } from '../../domain/community/community-types'
import type { PublicDeckRepository } from '../../domain/repositories/public-deck-repository'

export interface ListReportedDecksCommand {
  actor: Actor
}

export class ListReportedDecksUseCase {
  constructor(private readonly publicDecks: PublicDeckRepository) {}

  async execute(command: ListReportedDecksCommand): Promise<ReportedCommunityDeck[]> {
    requireManager(command.actor)
    return this.publicDecks.queueReports()
  }
}
