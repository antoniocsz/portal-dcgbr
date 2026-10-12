// Path: apps/web/src/features/admin/model/deck-moderation-api.ts
// Repository admin da moderação de decks da comunidade: fila de reportes
// agrupados, reportes abertos por publicação, dispensa e hide/restore. Rotas
// admin dedicadas em `/admin/decks/community/*` (administrator|editor — o
// backend revalida). Via @digimon/api-client (ADR-007). Sem hooks, sem JSX.
// Tipos literais em sync com o contrato do módulo @digimon/decks — o client web
// NÃO importa o pacote de domínio.
import { apiClient } from '@/lib/api-base'
import type { CommunityDeckStatus } from '@/features/decks/model/community-types'

export { ApiError } from '@digimon/api-client'
export type { CommunityDeckStatus } from '@/features/decks/model/community-types'

/** Ação de moderação sobre uma publicação. */
export type CommunityModerationAction = 'hide' | 'restore'

/** Agrupamento da fila de moderação: publicação com reportes abertos. */
export interface ReportedCommunityDeck {
  publicDeckId: string
  name: string
  ownerId: string
  ownerName: string
  status: CommunityDeckStatus
  likeCount: number
  reportCount: number
  lastReportedAt: string
}

/** Reporte individual aberto contra uma publicação. */
export interface CommunityDeckReport {
  id: string
  publicDeckId: string
  reporterAccountId: string | null
  reason: string
  details: string | null
  createdAt: string
  dismissedAt: string | null
}

export interface DismissReportsResult {
  dismissed: number
}

export interface ModerateDeckResult {
  status: CommunityDeckStatus
}

export const deckModerationApi = {
  async reportedDecks(): Promise<ReportedCommunityDeck[]> {
    const response = await apiClient.get<{ decks: ReportedCommunityDeck[] }>(
      '/admin/decks/community/reports'
    )
    return response.decks
  },

  openReports(publicDeckId: string): Promise<CommunityDeckReport[]> {
    return apiClient.get(`/admin/decks/community/${encodeURIComponent(publicDeckId)}/reports`)
  },

  dismissReports(publicDeckId: string): Promise<DismissReportsResult> {
    return apiClient.post(`/admin/decks/community/${encodeURIComponent(publicDeckId)}/reports/dismiss`)
  },

  moderate(publicDeckId: string, action: CommunityModerationAction): Promise<ModerateDeckResult> {
    return apiClient.post(`/admin/decks/community/${encodeURIComponent(publicDeckId)}/moderation`, {
      action
    })
  }
}
