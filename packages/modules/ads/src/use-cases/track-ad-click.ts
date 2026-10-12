// Path: packages/modules/ads/src/use-cases/track-ad-click.ts
// Incrementa `clicks` (público, best-effort): um id inexistente não falha o clique.
import type { AdRepository } from '../domain/repositories/ad-repository'

export interface TrackAdClickCommand {
  id: string
}

export class TrackAdClickUseCase {
  constructor(private readonly repo: AdRepository) {}

  async execute(command: TrackAdClickCommand): Promise<{ tracked: boolean }> {
    const ad = await this.repo.findById(command.id)
    if (!ad) return { tracked: false }

    await this.repo.incrementClicks(ad.id)
    return { tracked: true }
  }
}
