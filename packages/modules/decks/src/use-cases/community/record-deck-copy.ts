// Path: packages/modules/decks/src/use-cases/community/record-deck-copy.ts
// Registra que uma conta copiou a publicação. 1 cópia por conta
// (ON CONFLICT DO NOTHING no repo); o contador só incrementa quando insere.
import { NotFoundError } from '@digimon/contracts'
import type { Actor } from '../../domain/actor'
import type { PublicDeckRepository } from '../../domain/repositories/public-deck-repository'

export interface RecordDeckCopyCommand {
  actor: Actor
  publicDeckId: string
}

export interface RecordDeckCopyResult {
  copyCount: number
  counted: boolean
}

export class RecordDeckCopyUseCase {
  constructor(private readonly publicDecks: PublicDeckRepository) {}

  async execute(command: RecordDeckCopyCommand): Promise<RecordDeckCopyResult> {
    const record = await this.publicDecks.findById(command.publicDeckId)
    if (!record) throw new NotFoundError('Publicação não encontrada')

    const { created, copyCount } = await this.publicDecks.addCopy(
      command.publicDeckId,
      command.actor.id
    )
    return { copyCount, counted: created }
  }
}
