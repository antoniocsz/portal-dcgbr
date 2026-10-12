// Path: apps/web/src/features/decks/viewmodels/index.ts
// Barrel dos ViewModels públicos da feature decks.
export {
  dominantColors,
  deckCurve,
  groupDeckSections
} from './deck-sections'
export type {
  CardMetadataMap,
  DeckCurve,
  DeckCurveBucket,
  DeckSection,
  DeckSectionGroup,
  SectionCard
} from './deck-sections'
export {
  formatRelativeDate,
  statusLabel,
  toCommunityDeckCardData,
  toDeckCardData
} from './deck-view'
export { useDeckList } from './use-deck-list'
export type { DeckSummary, ListDecksParams } from './use-deck-list'
export { useDeck } from './use-deck'
export type { Deck } from './use-deck'
export { useDeckForm } from './use-deck-form'
export type {
  DeckFormValues,
  DeckImportSummary,
  DeckZone
} from './use-deck-form'
export { useCopyDeck, useDeleteDeck, usePublishDeck } from './use-deck-actions'
export {
  COMMUNITY_FEED_PAGE_SIZE,
  INITIAL_COMMUNITY_FILTERS,
  useCommunityDecks
} from './use-community-decks'
export type { CommunityFeedFilters } from './use-community-decks'
export { useCommunityDeck } from './use-community-deck'
export {
  useDeckImportExport
} from './use-deck-import-export'
export { useDeckPublications } from './use-deck-publications'
export type { PublicationView } from './use-deck-publications'
