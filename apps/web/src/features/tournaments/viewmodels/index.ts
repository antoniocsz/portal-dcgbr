// Path: apps/web/src/features/tournaments/viewmodels/index.ts
// Barrel dos ViewModels públicos da feature tournaments.
export {
  formatTournamentDate,
  statusLabel,
  statusTone,
  toTournamentCardData
} from './tournament-view'
export { useTournamentList } from './use-tournament-list'
export type { ListTournamentsParams, TournamentSummary } from './use-tournament-list'
export { useTournament } from './use-tournament'
export { useTournamentForm } from './use-tournament-form'
export type { TournamentFormValues } from './use-tournament-form'
export { useAddResults, useCancelTournament } from './use-tournament-actions'
export { useAdminTournaments } from './use-admin-tournaments'
export type { AdminStatusFilter } from './use-admin-tournaments'
