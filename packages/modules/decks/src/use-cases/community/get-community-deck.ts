// Path: packages/modules/decks/src/use-cases/community/get-community-deck.ts
// Detalhe público de uma publicação (com a composição congelada). Só publicações
// `public` são expostas — hidden/unpublished devolvem NotFound. Legalidade
// re-julgada na leitura.
import { NotFoundError } from '@digimon/contracts'
import type { Actor } from '../../domain/actor'
import type { CommunityDeck } from '../../domain/community/community-types'
import type { PublicDeckRepository } from '../../domain/repositories/public-deck-repository'
import { CheckDeckLegalityUseCase } from '../check-deck-legality'
import { toCommunityDeck } from './summary'

export interface GetCommunityDeckCommand {
  publicDeckId: string
  actor?: Actor | null
}

export class GetCommunityDeckUseCase {
  constructor(
    private readonly publicDecks: PublicDeckRepository,
    private readonly legality: CheckDeckLegalityUseCase
  ) {}

  async execute(command: GetCommunityDeckCommand): Promise<CommunityDeck> {
    const actor = command.actor ?? null
    const record = await this.publicDecks.findById(command.publicDeckId, actor?.id ?? null)
    if (!record) throw new NotFoundError('Publicação não encontrada')

    if (record.deck.status !== 'public') throw new NotFoundError('Publicação não encontrada')

    const legality = await this.legality.execute({
      cardList: record.deck.data.cardList,
      eggList: record.deck.data.eggList
    })
    return toCommunityDeck(record, legality.legal)
  }
}
