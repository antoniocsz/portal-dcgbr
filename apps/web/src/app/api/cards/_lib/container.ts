// Path: apps/web/src/app/api/cards/_lib/container.ts
// Composition root: instancia os use cases do módulo @digimon/cards com o
// PrismaClient (singleton de @digimon/database) e o EventBus in-process (ADR-005).
import { InMemoryEventBus } from '@digimon/contracts'
import { prisma } from '@digimon/database'
import {
  GetCardUseCase,
  ImportCardsUseCase,
  ListCardsUseCase,
  ListSetsUseCase,
  PrismaCardRepository,
  PrismaCardSetRepository
} from '@digimon/cards'

const eventBus = new InMemoryEventBus()
const cardRepository = new PrismaCardRepository(prisma)
const cardSetRepository = new PrismaCardSetRepository(prisma)

export const cards = {
  list: new ListCardsUseCase(cardRepository),
  get: new GetCardUseCase(cardRepository),
  listSets: new ListSetsUseCase(cardSetRepository),
  import: new ImportCardsUseCase(cardRepository, cardSetRepository, eventBus)
}
