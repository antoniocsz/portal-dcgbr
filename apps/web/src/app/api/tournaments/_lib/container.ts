// Path: apps/web/src/app/api/tournaments/_lib/container.ts
// Composition root (DIP): instancia os use cases do módulo @digimon/tournaments
// com o PrismaClient e o EventBus in-process (ADR-005).
// O handler de API não conhece implementações — só os use cases.
import { InMemoryEventBus } from '@digimon/contracts'
import { prisma } from '@digimon/database'
import {
  AddResultsUseCase,
  CancelTournamentUseCase,
  CreateTournamentUseCase,
  GetTournamentUseCase,
  ListTournamentsUseCase,
  PrismaTournamentRepository,
  UpdateTournamentUseCase
} from '@digimon/tournaments'

const eventBus = new InMemoryEventBus()
const tournamentRepository = new PrismaTournamentRepository(prisma)

export const tournaments = {
  create: new CreateTournamentUseCase(tournamentRepository, eventBus),
  update: new UpdateTournamentUseCase(tournamentRepository, eventBus),
  cancel: new CancelTournamentUseCase(tournamentRepository, eventBus),
  addResults: new AddResultsUseCase(tournamentRepository, eventBus),
  get: new GetTournamentUseCase(tournamentRepository),
  list: new ListTournamentsUseCase(tournamentRepository)
}
