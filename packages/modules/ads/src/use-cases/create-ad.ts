// Path: packages/modules/ads/src/use-cases/create-ad.ts
// Cria um anúncio (house | affiliate | sponsor). Curadoria: somente administrator.
import { randomUUID } from 'node:crypto'
import type { EventBus } from '@digimon/contracts'
import { ValidationError } from '@digimon/contracts'
import { requireCuradoria, type Actor } from '../domain/actor'
import { Ad } from '../domain/entities/ad'
import { adEvent } from '../domain/events/ad-events'
import type { AdRepository } from '../domain/repositories/ad-repository'
import { createAdSchema, type CreateAdInput } from './schemas'

export interface CreateAdCommand {
  actor: Actor
  input: CreateAdInput
}

export class CreateAdUseCase {
  constructor(
    private readonly repo: AdRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateAdCommand): Promise<{ id: string }> {
    requireCuradoria(command.actor)

    const parsed = createAdSchema.safeParse(command.input)
    if (!parsed.success) {
      throw new ValidationError('Dados inválidos do anúncio', parsed.error.flatten())
    }

    const ad = Ad.create({
      id: randomUUID(),
      title: parsed.data.title,
      subtitle: parsed.data.subtitle ?? null,
      imageUrl: parsed.data.imageUrl ?? null,
      targetUrl: parsed.data.targetUrl,
      kind: parsed.data.kind,
      placements: parsed.data.placements,
      ctaLabel: parsed.data.ctaLabel ?? null,
      sponsorName: parsed.data.sponsorName ?? null,
      disclosure: parsed.data.disclosure ?? null,
      isActive: parsed.data.isActive ?? true,
      priority: parsed.data.priority ?? 0,
      startAt: parsed.data.startAt ?? null,
      endAt: parsed.data.endAt ?? null,
      openInNewTab: parsed.data.openInNewTab ?? true,
      createdBy: command.actor.id
    })

    await this.repo.create(ad.data)
    await this.eventBus.publish(adEvent('ad.created', ad))

    return { id: ad.id }
  }
}
