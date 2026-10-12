// Path: packages/modules/ads/src/use-cases/update-ad.ts
// Edita o anúncio. Curadoria: somente administrator. Contadores não mudam aqui.
import type { EventBus } from '@digimon/contracts'
import { NotFoundError, ValidationError } from '@digimon/contracts'
import { requireCuradoria, type Actor } from '../domain/actor'
import type { UpdateAdData } from '../domain/entities/ad'
import { adEvent } from '../domain/events/ad-events'
import type { AdRepository } from '../domain/repositories/ad-repository'
import { updateAdSchema, type UpdateAdInput } from './schemas'

export interface UpdateAdCommand {
  actor: Actor
  id: string
  input: UpdateAdInput
}

export class UpdateAdUseCase {
  constructor(
    private readonly repo: AdRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: UpdateAdCommand): Promise<{ id: string }> {
    requireCuradoria(command.actor)

    const parsed = updateAdSchema.safeParse(command.input)
    if (!parsed.success) {
      throw new ValidationError('Dados inválidos do anúncio', parsed.error.flatten())
    }

    const ad = await this.repo.findById(command.id)
    if (!ad) throw new NotFoundError('Anúncio não encontrado')

    const patch: UpdateAdData = {}
    if (parsed.data.title !== undefined) patch.title = parsed.data.title
    if (parsed.data.subtitle !== undefined) patch.subtitle = parsed.data.subtitle
    if (parsed.data.imageUrl !== undefined) patch.imageUrl = parsed.data.imageUrl
    if (parsed.data.targetUrl !== undefined) patch.targetUrl = parsed.data.targetUrl
    if (parsed.data.kind !== undefined) patch.kind = parsed.data.kind
    if (parsed.data.placements !== undefined) patch.placements = parsed.data.placements
    if (parsed.data.ctaLabel !== undefined) patch.ctaLabel = parsed.data.ctaLabel
    if (parsed.data.sponsorName !== undefined) patch.sponsorName = parsed.data.sponsorName
    if (parsed.data.disclosure !== undefined) patch.disclosure = parsed.data.disclosure
    if (parsed.data.isActive !== undefined) patch.isActive = parsed.data.isActive
    if (parsed.data.priority !== undefined) patch.priority = parsed.data.priority
    if (parsed.data.startAt !== undefined) patch.startAt = parsed.data.startAt
    if (parsed.data.endAt !== undefined) patch.endAt = parsed.data.endAt
    if (parsed.data.openInNewTab !== undefined) patch.openInNewTab = parsed.data.openInNewTab

    ad.update(patch)
    await this.repo.update(ad)
    await this.eventBus.publish(adEvent('ad.updated', ad))

    return { id: ad.id }
  }
}
