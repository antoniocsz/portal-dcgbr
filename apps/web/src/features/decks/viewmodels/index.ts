// Path: apps/web/src/features/decks/viewmodels/index.ts
// Barrel dos ViewModels públicos da feature decks.
export {
  statusLabel,
  toDeckCardData
} from './deck-view'
export { useDeckList } from './use-deck-list'
export type { DeckSummary, ListDecksParams } from './use-deck-list'
export { useDeck } from './use-deck'
export type { Deck } from './use-deck'
export { useDeckForm } from './use-deck-form'
export type { DeckFormValues } from './use-deck-form'
export { useCopyDeck, useDeleteDeck, usePublishDeck } from './use-deck-actions'
