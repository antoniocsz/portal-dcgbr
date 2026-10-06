// Path: apps/web/src/features/admin/index.ts
// Barrel público da feature admin — Views e Model reaproveitáveis pelas
// próximas telas do painel. `model/session` (server-only) fica fora do barrel.
export * from './model/types'
export { adminApi } from './model/admin-api'
export type {
  AdminCommentItem,
  EditorialListParams,
  EditorialPostSummary
} from './model/admin-api'
export { adminDecksApi } from './model/admin-decks-api'
export type { AdminDecksListParams } from './model/admin-decks-api'
export { fetchSiteGateMode, setSiteGateMode } from './model/site-gate-api'
export type { SiteGateMode } from './model/site-gate-api'

export { AdminPageHeader } from './views/admin-page-header'
export type { AdminPageHeaderProps } from './views/admin-page-header'
export { AdminMetrics } from './views/admin-metrics'
export type { AdminMetricsProps } from './views/admin-metrics'
export { AdminTable } from './views/admin-table'
export type { AdminTableColumn, AdminTableProps } from './views/admin-table'
export {
  AdminRoleBadge,
  AdminStatusBadge,
  AdminPostBadge,
  AdminCommentBadge
} from './views/admin-badge'
export { ModerationQueue } from './views/moderation-queue'
export type { ModerationQueueProps } from './views/moderation-queue'
export { AdminShell } from './views/admin-shell'
export type { AdminShellProps } from './views/admin-shell'
export { AdminDashboardView } from './views/admin-dashboard-view'
export { AdminCommentsView } from './views/admin-comments-view'
export { AdminDecksView } from './views/admin-decks-view'
export { AdminPostsView, AdminPostFormView } from './views/admin-posts-view'
export { SiteSettingsView } from './views/site-settings-view'
export type { SiteSettingsViewProps } from './views/site-settings-view'

export { useAdminDashboardViewModel } from './viewmodels/use-admin-dashboard-view-model'
export { useAdminCommentsViewModel } from './viewmodels/use-admin-comments-view-model'
export type { AdminCommentStatusFilter } from './viewmodels/use-admin-comments-view-model'
export { useAdminPosts, useAdminPostForm, toPostFormValues } from './viewmodels/use-admin-posts'
export type { AdminPostFormData } from './viewmodels/use-admin-posts'
export { useAdminDecks } from './viewmodels/use-admin-decks'
export { useSiteGate } from './viewmodels/use-site-gate'
export type { SiteGateFeedback } from './viewmodels/use-site-gate'
