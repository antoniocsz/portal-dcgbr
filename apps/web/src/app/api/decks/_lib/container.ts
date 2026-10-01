// Path: apps/web/src/app/api/decks/_lib/container.ts
// Composition root (DIP): instancia os use cases do módulo @digimon/decks com
// o PrismaClient e o EventBus in-process (ADR-005). O validador de cartas usa
// o catálogo @digimon/cards (tabela cards) para garantir a referência do cardList.
import { InMemoryEventBus } from '@digimon/contracts'
import { prisma } from '@digimon/database'
import {
  CopyDeckUseCase,
  CreateDeckUseCase,
  DeleteDeckUseCase,
  GetDeckUseCase,
  ListDecksUseCase,
  PrismaDeckRepository,
  PublishDeckUseCase,
  UpdateDeckUseCase
} from '@digimon/decks'
import { PrismaCardReferenceValidator } from './card-reference-validator'

const eventBus = new InMemoryEventBus()
const deckRepository = new PrismaDeckRepository(prisma)
const cardValidator = new PrismaCardReferenceValidator()

export const decks = {
  create: new CreateDeckUseCase(deckRepository, cardValidator, eventBus),
  update: new UpdateDeckUseCase(deckRepository, cardValidator, eventBus),
  publish: new PublishDeckUseCase(deckRepository, eventBus),
  remove: new DeleteDeckUseCase(deckRepository),
  get: new GetDeckUseCase(deckRepository),
  list: new ListDecksUseCase(deckRepository),
  copy: new CopyDeckUseCase(deckRepository, eventBus)
}
