// Path: apps/web/src/components/index.ts
// Design system (dcg.pen) — barrel de exportação dos componentes compartilhados.

// Primitives
export * from './ui'

// Cards compostos
export { PostCard } from './post-card'
export type { PostCardData, PostCardProps } from './post-card'
export { CardTile } from './card-tile'
export type { CardTileData, CardTileProps } from './card-tile'
export { DeckCard } from './deck-card'
export type { DeckCardData, DeckCardProps } from './deck-card'
export { TournamentCard } from './tournament-card'
export type { TournamentCardData, TournamentCardProps } from './tournament-card'
export { CommentRow } from './comment-row'
export type { CommentRowProps } from './comment-row'

// Chrome público
export { SiteHeader } from './site-header'
export type { SiteHeaderProps } from './site-header'
export { SiteFooter } from './site-footer'
export { SiteChrome } from './site-chrome'
export type { SiteChromeProps } from './site-chrome'

// Admin
export * from './admin'

// Ícones e tokens de atributo
export * from './icons'
export { ATTRIBUTE_COLORS, ATTRIBUTE_LABELS } from './attribute-colors'
export type { AttributeColor } from './attribute-colors'
