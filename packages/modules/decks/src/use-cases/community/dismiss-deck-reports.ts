// Path: packages/modules/decks/src/use-cases/community/dismiss-deck-reports.ts
// Dispensa (fecha sem ocultar) os reportes abertos de uma publicação. Só
// administrator|editor.
import { requireManager, type Actor } from '../../domain/actor'
import type { PublicDeckRepository } from '../../domain/repositories/public-deck-repository'

export interface DismissDeckReportsCommand {
  actor: Actor
  publicDeckId: string
}

export interface DismissDeckReportsResult {
  dismissed: number
}

export class DismissDeckReportsUseCase {
  constructor(private readonly publicDecks: PublicDeckRepository) {}

  async execute(
    command: DismissDeckReportsCommand
  ): Promise<DismissDeckReportsResult> {
    requireManager(command.actor)
    const dismissed = await this.publicDecks.dismissReports(command.publicDeckId)
    return { dismissed }
  }
}
