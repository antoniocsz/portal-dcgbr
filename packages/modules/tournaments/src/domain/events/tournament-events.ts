// Path: packages/modules/tournaments/src/domain/events/tournament-events.ts
// Eventos que o módulo tournaments publica via EventBus (@digimon/contracts).
import type { DomainEvent } from '@digimon/contracts'
import type { Tournament } from '../entities/tournament'

export type TournamentEventType =
  | 'tournament.created'
  | 'tournament.updated'
  | 'tournament.cancelled'
  | 'tournament.results.added'

export interface TournamentEvent extends DomainEvent {
  type: TournamentEventType
  tournamentId: string
  slug: string
}

export function tournamentEvent(
  type: TournamentEventType,
  tournament: Tournament
): TournamentEvent {
  return {
    type,
    occurredAt: new Date(),
    tournamentId: tournament.id,
    slug: tournament.slug
  }
}
