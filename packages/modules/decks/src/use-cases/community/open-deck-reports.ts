// Path: packages/modules/decks/src/use-cases/community/open-deck-reports.ts
// Reportes abertos de uma publicação (detalhe da fila de moderação). Só
// administrator|editor.
import { requireManager, type Actor } from '../../domain/actor'
import type { CommunityDeckReport } from '../../domain/community/community-types'
import type { PublicDeckRepository } from '../../domain/repositories/public-deck-repository'

export interface OpenDeckReportsCommand {
  actor: Actor
  publicDeckId: string
}

export class OpenDeckReportsUseCase {
  constructor(private readonly publicDecks: PublicDeckRepository) {}

  async execute(command: OpenDeckReportsCommand): Promise<CommunityDeckReport[]> {
    requireManager(command.actor)
    return this.publicDecks.listReports(command.publicDeckId)
  }
}
