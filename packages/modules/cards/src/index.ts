// Barrel público do módulo @digimon/cards — única porta de entrada do pacote.
// Exporta somente o público. Nunca imports internos de outros módulos (ESLint boundaries).

// Domínio
export {
  CARD_COLORS,
  CARD_TYPES,
  DEFAULT_MAX_COUNT_IN_DECK,
  Card,
  parseEvolutionConditions
} from './domain/entities/card'
export type {
  CardColor,
  CardData,
  CardInputData,
  CardType,
  CreateCardData,
  EvolutionCondition
} from './domain/entities/card'
export { CardSet } from './domain/entities/card-set'
export type { CardSetData, CreateCardSetData } from './domain/entities/card-set'
export { CURATOR_ROLES, isCurator, requireCurator } from './domain/actor'
export type { CardActor } from './domain/actor'
export type { CardSourceProvider, RawSourceCard } from './domain/sources/card-source-provider'
export { mapTakaCard } from './domain/sources/taka/taka-card-mapper'
export type { CardImportInput, TakaCardRecord } from './domain/sources/taka/taka-card-mapper'
export { deriveTakaSets, parseTakaSetNotes } from './domain/sources/taka/taka-set-derivation'
export type {
  DerivedCardSet,
  TakaSetCandidate
} from './domain/sources/taka/taka-set-derivation'
export { cardEvent } from './domain/events/card-events'
export type { CardEvent, CardEventType } from './domain/events/card-events'
export type { CardRepository, ListCardsParams } from './domain/repositories/card-repository'
export type { CardSetRepository } from './domain/repositories/card-set-repository'

// Use cases
export { ImportCardsUseCase } from './use-cases/import-cards'
export type { ImportCardsCommand, ImportCardsResult } from './use-cases/import-cards'
export { ImportCardsFromSourceUseCase } from './use-cases/import-cards-from-source'
export type {
  ImportCardsFromSourceCommand,
  ImportCardsFromSourceResult
} from './use-cases/import-cards-from-source'
export { GetCardUseCase } from './use-cases/get-card'
export type { GetCardCommand } from './use-cases/get-card'
export { ListCardsUseCase } from './use-cases/list-cards'
export type { ListCardsCommand } from './use-cases/list-cards'
export { ListSetsUseCase } from './use-cases/list-sets'

// Schemas de entrada (usados pelos route handlers do apps/web)
export {
  cardColorSchema,
  cardInputSchema,
  cardSetInputSchema,
  cardTypeSchema,
  evolutionConditionSchema,
  importCardsFromSourceSchema,
  importCardsSchema,
  listCardsSchema
} from './use-cases/schemas'
export type {
  CardInput,
  CardSetInput,
  ImportCardsFromSourceInput,
  ImportCardsInput,
  ListCardsInput
} from './use-cases/schemas'

// Infra
export { PrismaCardRepository } from './infra/repositories/prisma-card-repository'
export { PrismaCardSetRepository } from './infra/repositories/prisma-card-set-repository'
export { TAKA_CARDS_URL, TakaCardsSourceProvider } from './infra/sources/taka-cards-source-provider'
export type { TakaCardsSourceProviderOptions } from './infra/sources/taka-cards-source-provider'
