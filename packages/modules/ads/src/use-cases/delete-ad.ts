// Path: packages/modules/ads/src/use-cases/delete-ad.ts
// Remove um anúncio. Curadoria: somente administrator.
import type { EventBus } from '@digimon/contracts'
import { NotFoundError } from '@digimon/contracts'
import { requireCuradoria, type Actor } from '../domain/actor'
import { adEvent } from '../domain/events/ad-events'
import type { AdRepository } from '../domain/repositories/ad-repository'

export interface DeleteAdCommand {
  actor: Actor
  id: string
}

export class DeleteAdUseCase {
  constructor(
    private readonly repo: AdRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: DeleteAdCommand): Promise<{ id: string; deleted: true }> {
    requireCuradoria(command.actor)

    const ad = await this.repo.findById(command.id)
    if (!ad) throw new NotFoundError('Anúncio não encontrado')

    await this.repo.delete(ad.id)
    await this.eventBus.publish(adEvent('ad.deleted', ad))

    return { id: ad.id, deleted: true }
  }
}
