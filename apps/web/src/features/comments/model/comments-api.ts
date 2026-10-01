// apps/web/src/features/comments/model/comments-api.ts
// Model — tipos e acesso à API de comentários. Sem hooks, sem JSX (MVVM estrito).

export type CommentTargetType = 'post' | 'card' | 'deck'
export type CommentStatus = 'visible' | 'hidden' | 'deleted'

export interface CommentDTO {
  id: string
  authorId: string
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

async function parseError(response: Response): Promise<Error> {
  try {
    const body = (await response.json()) as { error?: { message?: string } }
    return new Error(body.error?.message ?? 'Erro inesperado')
  } catch {
    return new Error('Erro inesperado')
  }
}

export async function listComments(params: {
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

  const response = await fetch(`/api/comments?${search.toString()}`, { cache: 'no-store' })
  if (!response.ok) throw await parseError(response)
  return response.json() as Promise<ListCommentsResult>
}

export async function createComment(payload: CreateCommentPayload): Promise<CommentDTO> {
  const response = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!response.ok) throw await parseError(response)
  const body = (await response.json()) as { comment: CommentDTO }
  return body.comment
}

export async function updateComment(id: string, body: string): Promise<CommentDTO> {
  const response = await fetch(`/api/comments/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ body })
  })
  if (!response.ok) throw await parseError(response)
  const json = (await response.json()) as { comment: CommentDTO }
  return json.comment
}

export async function deleteComment(id: string): Promise<void> {
  const response = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
  if (!response.ok) throw await parseError(response)
}

export async function moderateComment(id: string, action: 'hide' | 'show'): Promise<CommentDTO> {
  const response = await fetch(`/api/comments/${id}/moderate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action })
  })
  if (!response.ok) throw await parseError(response)
  const body = (await response.json()) as { comment: CommentDTO }
  return body.comment
}
