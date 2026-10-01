// Path: apps/web/src/features/content/viewmodels/index.ts
// Barrel dos ViewModels públicos de conteúdo.
export { useHome } from './use-home'
export type { HomeData } from './use-home'
export { useNewsList } from './use-news-list'
export { useSimulators } from './use-simulators'
export type { SimulatorView, SimulatorIconName, SimulatorsData } from './use-simulators'
export {
  categoryLabel,
  estimateReadingTime,
  formatPostDate,
  toFeaturedPostView,
  toPostCardData,
  PORTAL_AUTHOR
} from './post-view'
export type { FeaturedPostView } from './post-view'
