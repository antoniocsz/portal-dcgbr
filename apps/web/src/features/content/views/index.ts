// Path: apps/web/src/features/content/views/index.ts
// Barrel das Views públicas de conteúdo (Home, listagem, artigo, simuladores).
export { HomeView } from './home-view'
export { NewsListView } from './news-list-view'
export type { NewsListViewProps } from './news-list-view'
export { SimulatorsView } from './simulators-view'
export { PostArticle } from './post-article'
export type { PostArticleProps } from './post-article'

// Views reutilizáveis
export { Hero } from './hero'
export type { HeroProps } from './hero'
export { NewsGrid } from './news-grid'
export type { NewsGridProps } from './news-grid'
export { SimulatorCard, SimulatorIcon } from './simulator-card'
export type { SimulatorCardProps, SimulatorIconProps } from './simulator-card'
