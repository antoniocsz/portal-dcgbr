// Path: packages/modules/cards/src/use-cases/get-card.ts
// Ficha da carta por id interno, dcgId ou número. Leitura pública.
import { NotFoundError, ValidationError } from '@digimon/contracts'
import type { Card } from '../domain/entities/card'
import type { CardRepository } from '../domain/repositories/card-repository'

export interface GetCardCommand {
  id?: string
  number?: string
}

export class GetCardUseCase {
  constructor(private readonly repo: CardRepository) {}

  async execute(command: GetCardCommand): Promise<Card> {
    if (command.id) {
      const byId = await this.repo.findById(command.id)
      if (byId) return byId
      const byDcgId = await this.repo.findByDcgId(command.id)
      if (byDcgId) return byDcgId
      throw new NotFoundError('Carta não encontrada')
    }

    if (command.number) {
      const byNumber = await this.repo.findByNumber(command.number)
      if (byNumber) return byNumber
      throw new NotFoundError('Carta não encontrada')
    }

    throw new ValidationError('Informe o id ou o número da carta')
  }
}
