// Path: packages/modules/ads/src/use-cases/get-ad.ts
// Leitura por id. Uso administrativo — exige curadoria (administrator).
import { NotFoundError } from '@digimon/contracts'
import { requireCuradoria, type Actor } from '../domain/actor'
import type { Ad } from '../domain/entities/ad'
import type { AdRepository } from '../domain/repositories/ad-repository'

export interface GetAdCommand {
  actor: Actor
  id: string
}

export class GetAdUseCase {
  constructor(private readonly repo: AdRepository) {}

  async execute(command: GetAdCommand): Promise<Ad> {
    requireCuradoria(command.actor)

    const ad = await this.repo.findById(command.id)
    if (!ad) throw new NotFoundError('Anúncio não encontrado')
    return ad
  }
}
