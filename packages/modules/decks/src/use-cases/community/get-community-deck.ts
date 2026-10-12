// Path: packages/modules/decks/src/use-cases/community/get-community-deck.ts
// Detalhe público de uma publicação (com a composição congelada). Publicações
// hidden/unpublished só são visíveis para moderação (administrator|editor) com
// `includeHidden`. Legalidade re-julgada na leitura.
import { NotFoundError } from '@digimon/contracts'
import { isManager, type Actor } from '../../domain/actor'
import type { CommunityDeck } from '../../domain/community/community-types'
import type { PublicDeckRepository } from '../../domain/repositories/public-deck-repository'
import { CheckDeckLegalityUseCase } from '../check-deck-legality'
import { toCommunityDeck } from './summary'

export interface GetCommunityDeckCommand {
  publicDeckId: string
  actor?: Actor | null
  /** Só para moderação: permite ler publicações hidden/unpublished. */
  includeHidden?: boolean
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

    const visible =
      record.deck.status === 'public' ||
      (command.includeHidden === true && isManager(actor))
    if (!visible) throw new NotFoundError('Publicação não encontrada')

    const legality = await this.legality.execute({
      cardList: record.deck.data.cardList,
      eggList: record.deck.data.eggList
    })
    return toCommunityDeck(record, legality.legal)
  }
}
