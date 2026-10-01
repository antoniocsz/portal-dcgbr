// Path: apps/web/src/features/admin/model/types.ts
// Tipos do painel administrativo (métricas, linhas de tabela e moderação).
// Camada Model do MVVM estrito: sem hooks, sem JSX.
import type { CommentStatus, PostStatus } from '@digimon/contracts'

export type AdminTrendTone = 'success' | 'warning' | 'neutral'

export interface AdminMetric {
  label: string
  value: string
  trend?: string
  trendTone?: AdminTrendTone
}

export interface AdminPostRow {
  id: string
  title: string
  status: PostStatus
  authorId: string
  date: string
}

/** Filtro de status da listagem editorial de posts (admin/posts). */
export type AdminPostStatusFilter = 'all' | PostStatus

export interface AdminCommentRow {
  id: string
  body: string
  status: CommentStatus
  authorName: string
  date: string
}

export interface ModerationItem {
  id: string
  authorName: string
  title: string
  detail: string
  tone: 'warning' | 'danger'
}
