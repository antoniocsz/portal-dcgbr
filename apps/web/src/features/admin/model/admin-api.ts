// Path: apps/web/src/features/admin/model/admin-api.ts
// Repository do painel admin: listagem editorial de posts, contagem por status
// e ações de gestão. Reaproveita contentApi (@/features/content) e comments-api
// (@/features/comments) — sem duplicar chamadas. Sem hooks, sem JSX (Model).
import type { PaginatedResult, PostStatus } from '@digimon/contracts'
import { contentApi } from '@/features/content/model/api'
import { moderateComment } from '@/features/comments/model/comments-api'

export interface EditorialPostSummary {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImage: string | null
  category: string
  status: string
  authorId?: string
  authorName?: string
  publishedAt: string | null
  updatedAt: string
}

/** Comentário global (moderação) com nome do autor. */
export interface AdminCommentItem {
  id: string
  authorId: string
  authorName: string
  targetType: string
  targetId: string
  body: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface EditorialListParams {
  status?: PostStatus
  page?: number
  pageSize?: number
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers }
  })
  if (!response.ok) {
    let message = `Erro ${response.status}`
    try {
      const body = (await response.json()) as { error?: { message?: string } }
      if (body.error?.message) message = body.error.message
    } catch {
      // corpo não-JSON: mantém a mensagem padrão
    }
    throw new Error(message)
  }
  return (await response.json()) as T
}

function buildQuery(params: EditorialListParams): string {
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize))
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const adminApi = {
  listEditorialPosts(
    params: EditorialListParams = {}
  ): Promise<PaginatedResult<EditorialPostSummary>> {
    return request(`/api/posts/admin${buildQuery(params)}`)
  },

  async countByStatus(status: PostStatus): Promise<number> {
    const result = await request<PaginatedResult<EditorialPostSummary>>(
      `/api/posts/admin${buildQuery({ status, pageSize: 1 })}`
    )
    return result.total
  },

  /** Busca um post por id com status editorial (draft/review/published/archived). */
  getEditorialPost(id: string): Promise<EditorialPostSummary> {
    return request(`/api/posts/admin/${id}`)
  },

  publishPost(id: string): Promise<{ id: string; publishedAt: string }> {
    return contentApi.publish(id)
  },

  archivePost(id: string): Promise<{ id: string; status: 'archived' }> {
    return contentApi.archive(id)
  },

  moderateComment(id: string, action: 'hide' | 'show'): Promise<unknown> {
    return moderateComment(id, action)
  },

  /** Listagem global de comentários para moderação (Admin/Editor). */
  listAdminComments(params: {
    status?: string
    targetType?: string
    page?: number
    pageSize?: number
  } = {}): Promise<PaginatedResult<AdminCommentItem>> {
    const search = new URLSearchParams()
    if (params.status) search.set('status', params.status)
    if (params.targetType) search.set('targetType', params.targetType)
    if (params.page !== undefined) search.set('page', String(params.page))
    if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize))
    const qs = search.toString()
    return request(`/api/comments/admin${qs ? `?${qs}` : ''}`)
  }
}
