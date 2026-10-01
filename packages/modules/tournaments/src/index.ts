// Barrel público do módulo @digimon/tournaments — única porta de entrada do pacote.
// Exporta somente o público. Nunca imports internos de outros módulos (ESLint boundaries).

// Domínio
export { canManage, isManager, MANAGER_ROLES, requireCanManage } from './domain/actor'
export type { Actor } from './domain/actor'
export { Tournament, slugify, SLUG_PATTERN } from './domain/entities/tournament'
export type {
  CreateTournamentData,
  TournamentData,
  TournamentResultEntry,
  TournamentStatus,
  UpdateTournamentData
} from './domain/entities/tournament'
export { tournamentEvent } from './domain/events/tournament-events'
export type { TournamentEvent, TournamentEventType } from './domain/events/tournament-events'
export type {
  ListTournamentsParams,
  TournamentRepository
} from './domain/repositories/tournament-repository'

// Use cases
export { CreateTournamentUseCase } from './use-cases/create-tournament'
export type { CreateTournamentCommand } from './use-cases/create-tournament'
export { UpdateTournamentUseCase } from './use-cases/update-tournament'
export type { UpdateTournamentCommand } from './use-cases/update-tournament'
export { CancelTournamentUseCase } from './use-cases/cancel-tournament'
export type { CancelTournamentCommand } from './use-cases/cancel-tournament'
export { AddResultsUseCase } from './use-cases/add-results'
export type { AddResultsCommand } from './use-cases/add-results'
export { GetTournamentUseCase } from './use-cases/get-tournament'
export type { GetTournamentCommand } from './use-cases/get-tournament'
export { ListTournamentsUseCase } from './use-cases/list-tournaments'
export type { ListTournamentsCommand } from './use-cases/list-tournaments'

// Schemas de entrada (usados pelos route handlers do apps/web)
export {
  addResultsSchema,
  createTournamentSchema,
  listTournamentsSchema,
  tournamentResultSchema,
  tournamentStatusSchema,
  updateTournamentSchema
} from './use-cases/schemas'
export type {
  AddResultsInput,
  CreateTournamentInput,
  ListTournamentsInput,
  UpdateTournamentInput
} from './use-cases/schemas'

// Infra
export { PrismaTournamentRepository } from './infra/repositories/prisma-tournament-repository'
