// Barrel público do módulo @digimon/decks — única porta de entrada do pacote.
// Exporta somente o público. Nunca imports internos de outros módulos (ESLint boundaries).

// Domínio
export { isOwner, requireOwner } from './domain/actor'
export type { Actor } from './domain/actor'
export { Deck, slugify, SLUG_PATTERN } from './domain/entities/deck'
export type {
  CreateDeckData,
  DeckCardEntry,
  DeckData,
  DeckStatus,
  UpdateDeckData
} from './domain/entities/deck'
export { DeckCopy } from './domain/entities/deck-copy'
export type { DeckCopyData } from './domain/entities/deck-copy'
export { deckEvent } from './domain/events/deck-events'
export type { DeckEvent, DeckEventType } from './domain/events/deck-events'
export type {
  DeckRepository,
  ListDecksParams
} from './domain/repositories/deck-repository'
export type { CardReferenceValidator } from './domain/repositories/card-reference-validator'

// Use cases
export { CreateDeckUseCase } from './use-cases/create-deck'
export type { CreateDeckCommand } from './use-cases/create-deck'
export { UpdateDeckUseCase } from './use-cases/update-deck'
export type { UpdateDeckCommand } from './use-cases/update-deck'
export { PublishDeckUseCase } from './use-cases/publish-deck'
export type { PublishDeckCommand } from './use-cases/publish-deck'
export { DeleteDeckUseCase } from './use-cases/delete-deck'
export type { DeleteDeckCommand } from './use-cases/delete-deck'
export { GetDeckUseCase } from './use-cases/get-deck'
export type { GetDeckCommand } from './use-cases/get-deck'
export { ListDecksUseCase } from './use-cases/list-decks'
export type { ListDecksCommand } from './use-cases/list-decks'
export { CopyDeckUseCase } from './use-cases/copy-deck'
export type { CopyDeckCommand } from './use-cases/copy-deck'

// Schemas de entrada (usados pelos route handlers do apps/web)
export {
  createDeckSchema,
  deckCardSchema,
  deckStatusSchema,
  listDecksSchema,
  updateDeckSchema
} from './use-cases/schemas'
export type {
  CreateDeckInput,
  ListDecksInput,
  UpdateDeckInput
} from './use-cases/schemas'

// Infra
export { PrismaDeckRepository } from './infra/repositories/prisma-deck-repository'
