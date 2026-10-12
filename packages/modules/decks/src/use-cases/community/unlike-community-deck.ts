// Path: packages/modules/decks/src/use-cases/community/unlike-community-deck.ts
// Descurtir uma publicação (idempotente — remover o que não existe é no-op).
import { NotFoundError } from '@digimon/contracts'
import type { Actor } from '../../domain/actor'
import type { PublicDeckRepository } from '../../domain/repositories/public-deck-repository'

export interface UnlikeCommunityDeckCommand {
  actor: Actor
  publicDeckId: string
}

export interface UnlikeCommunityDeckResult {
  likeCount: number
  liked: boolean
}

export class UnlikeCommunityDeckUseCase {
  constructor(private readonly publicDecks: PublicDeckRepository) {}

  async execute(command: UnlikeCommunityDeckCommand): Promise<UnlikeCommunityDeckResult> {
    const record = await this.publicDecks.findById(command.publicDeckId)
    if (!record) throw new NotFoundError('Publicação não encontrada')

    const { likeCount } = await this.publicDecks.unlike(
      command.publicDeckId,
      command.actor.id
    )
    return { likeCount, liked: false }
  }
}
