// Barrel público do módulo @digimon/decks — única porta de entrada do pacote.
// Exporta somente o público. Nunca imports internos de outros módulos (ESLint boundaries).

// Domínio
export {
  isManager,
  isOwner,
  MANAGER_ROLES,
  requireManager,
  requireOwner
} from './domain/actor'
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
export { PublicDeck } from './domain/entities/public-deck'
export type { PublicDeckData, RefreshSnapshotPatch } from './domain/entities/public-deck'
export {
  COMMUNITY_MAX_COLORS,
  dominantColors
} from './domain/community/community-colors'
export type { CardColorInfo, DeckColorResolver } from './domain/community/community-colors'
export { DECK_NAME_MAX_LENGTH, reviewDeckName } from './domain/community/deck-name-moderation'
export type { DeckNameReview } from './domain/community/deck-name-moderation'
export type {
  CommunityDeck,
  CommunityDeckPage,
  CommunityDeckReport,
  CommunityDeckStatus,
  CommunityDeckSummary,
  CommunityModerationAction,
  CommunityPeriod,
  CommunityPublication,
  CommunityReportReason,
  CommunitySort,
  ReportedCommunityDeck
} from './domain/community/community-types'
export { normalizeCardNumber, parseDeckList } from './domain/deck-list/parse-deck-list'
export { serializeDeckList } from './domain/deck-list/serialize-deck-list'
export type {
  DeckCardResolver,
  DeckListParseResult,
  ResolvedDeckCard,
  SerializableDeckList
} from './domain/deck-list/types'
export { deckEvent } from './domain/events/deck-events'
export type { DeckEvent, DeckEventType } from './domain/events/deck-events'
export { deckPublicationEvent } from './domain/events/deck-events'
export type {
  DeckPublicationEvent,
  DeckPublicationEventType
} from './domain/events/deck-events'
export type {
  DeckRepository,
  ListDecksParams
} from './domain/repositories/deck-repository'
export type {
  CardReferenceInfo,
  CardReferenceValidator
} from './domain/repositories/card-reference-validator'
export type {
  CopyResult,
  CreatePublicDeckReportData,
  LikeResult,
  ListPublicDecksQuery,
  PublicDeckPage,
  PublicDeckRecord,
  PublicDeckRepository,
  PublicationRecord,
  UnlikeResult
} from './domain/repositories/public-deck-repository'

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
export {
  CheckDeckLegalityUseCase,
  DEFAULT_MAX_COUNT_IN_DECK,
  EGG_DECK_SIZE,
  MAIN_DECK_SIZE
} from './use-cases/check-deck-legality'
export type {
  CheckDeckLegalityCommand,
  DeckLegalityResult,
  DeckLegalityViolation,
  DeckLegalityViolationCode
} from './use-cases/check-deck-legality'

// Use cases — comunidade de decks
export {
  PublishDeckToCommunityUseCase
} from './use-cases/community/publish-deck-to-community'
export type {
  PublishDeckToCommunityCommand,
  PublishDeckToCommunityResult
} from './use-cases/community/publish-deck-to-community'
export {
  UnpublishDeckFromCommunityUseCase
} from './use-cases/community/unpublish-deck-from-community'
export type {
  UnpublishDeckFromCommunityCommand,
  UnpublishDeckFromCommunityResult
} from './use-cases/community/unpublish-deck-from-community'
export { ListPublicationsUseCase } from './use-cases/community/list-publications'
export type { ListPublicationsCommand } from './use-cases/community/list-publications'
export {
  COMMUNITY_PAGE_SIZE,
  ListCommunityDecksUseCase
} from './use-cases/community/list-community-decks'
export type { ListCommunityDecksCommand } from './use-cases/community/list-community-decks'
export { GetCommunityDeckUseCase } from './use-cases/community/get-community-deck'
export type { GetCommunityDeckCommand } from './use-cases/community/get-community-deck'
export { LikeCommunityDeckUseCase } from './use-cases/community/like-community-deck'
export type {
  LikeCommunityDeckCommand,
  LikeCommunityDeckResult
} from './use-cases/community/like-community-deck'
export { UnlikeCommunityDeckUseCase } from './use-cases/community/unlike-community-deck'
export type {
  UnlikeCommunityDeckCommand,
  UnlikeCommunityDeckResult
} from './use-cases/community/unlike-community-deck'
export { RecordDeckCopyUseCase } from './use-cases/community/record-deck-copy'
export type {
  RecordDeckCopyCommand,
  RecordDeckCopyResult
} from './use-cases/community/record-deck-copy'
export { ReportCommunityDeckUseCase } from './use-cases/community/report-community-deck'
export type {
  ReportCommunityDeckCommand,
  ReportCommunityDeckResult,
  ReportedDeckTarget
} from './use-cases/community/report-community-deck'
export { ModerateCommunityDeckUseCase } from './use-cases/community/moderate-community-deck'
export type {
  ModerateCommunityDeckCommand,
  ModerateCommunityDeckResult
} from './use-cases/community/moderate-community-deck'
export { ListReportedDecksUseCase } from './use-cases/community/list-reported-decks'
export type { ListReportedDecksCommand } from './use-cases/community/list-reported-decks'
export { OpenDeckReportsUseCase } from './use-cases/community/open-deck-reports'
export type { OpenDeckReportsCommand } from './use-cases/community/open-deck-reports'
export { DismissDeckReportsUseCase } from './use-cases/community/dismiss-deck-reports'
export type {
  DismissDeckReportsCommand,
  DismissDeckReportsResult
} from './use-cases/community/dismiss-deck-reports'

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

// Schemas de entrada — comunidade de decks
export {
  communityDeckStatusSchema,
  communityModerationActionSchema,
  communityPeriodSchema,
  communityReportReasonSchema,
  communitySortSchema,
  listCommunityDecksSchema,
  reportCommunityDeckSchema
} from './use-cases/community/schemas'
export type {
  ListCommunityDecksInput,
  ReportCommunityDeckInput
} from './use-cases/community/schemas'

// Infra
export { PrismaDeckRepository } from './infra/repositories/prisma-deck-repository'
export {
  PrismaPublicDeckRepository
} from './infra/repositories/prisma-public-deck-repository'
