// apps/web/src/features/comments/model/comments-api.ts
// Model — tipos e acesso à API de comentários (ADR-007) via @digimon/api-client.
// Sem hooks, sem JSX (MVVM estrito).
import { apiClient } from '@/lib/api-base'

export type CommentTargetType = 'post' | 'card' | 'deck'
export type CommentStatus = 'visible' | 'hidden' | 'deleted'

export interface CommentDTO {
  id: string
  authorId: string
  authorName: string
  targetType: CommentTargetType
  targetId: string
  body: string
  status: CommentStatus
  createdAt: string
  updatedAt: string
}

export interface ListCommentsResult {
  items: CommentDTO[]
  total: number
  page: number
  pageSize: number
}

export interface CreateCommentPayload {
  targetType: CommentTargetType
  targetId: string
  body: string
}

export function listComments(params: {
  targetType: CommentTargetType
  targetId: string
  page?: number
  pageSize?: number
}): Promise<ListCommentsResult> {
  const search = new URLSearchParams({
    targetType: params.targetType,
    targetId: params.targetId
  })
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize))

  return apiClient.request<ListCommentsResult>(`/comments?${search.toString()}`, {
    cache: 'no-store'
  })
}

/** Comentários do próprio autor (perfil) — `GET /comments?mine=true`, mesmo shape. */
export function listMyComments(
  params: { page?: number; pageSize?: number } = {}
): Promise<ListCommentsResult> {
  const search = new URLSearchParams({ mine: 'true' })
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize))

  return apiClient.request<ListCommentsResult>(`/comments?${search.toString()}`, {
    cache: 'no-store'
  })
}

export async function createComment(payload: CreateCommentPayload): Promise<CommentDTO> {
  const { comment } = await apiClient.post<{ comment: CommentDTO }>('/comments', payload)
  return comment
}

export async function updateComment(id: string, body: string): Promise<CommentDTO> {
  const { comment } = await apiClient.patch<{ comment: CommentDTO }>(`/comments/${id}`, { body })
  return comment
}

export async function deleteComment(id: string): Promise<void> {
  await apiClient.delete<void>(`/comments/${id}`)
}

export async function moderateComment(id: string, action: 'hide' | 'show'): Promise<CommentDTO> {
  const { comment } = await apiClient.post<{ comment: CommentDTO }>(`/comments/${id}/moderate`, {
    action
  })
  return comment
}
