// Path: apps/web/src/features/content/model/api.ts
// Repository da feature: chamadas fetch para a API /api/posts.
// Sem hooks, sem JSX — camada Model do MVVM estrito.
import type { CreatePostResult, ListPostsParams, Paginated, Post, PostInput, PostSummary } from './types'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers }
  })
  if (!response.ok) {
    let message = 'Erro inesperado'
    let code = 'INTERNAL_ERROR'
    try {
      const body = (await response.json()) as { error?: { message?: string; code?: string } }
      if (body.error?.message) message = body.error.message
      if (body.error?.code) code = body.error.code
    } catch {
      // corpo não-JSON: mantém mensagem padrão
    }
    throw new ApiError(message, response.status, code)
  }
  return (await response.json()) as T
}

function buildQuery(params: ListPostsParams): string {
  const search = new URLSearchParams()
  if (params.category) search.set('category', params.category)
  if (params.status) search.set('status', params.status)
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize))
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const contentApi = {
  listPosts(params: ListPostsParams = {}): Promise<Paginated<PostSummary>> {
    return request(`/api/posts${buildQuery(params)}`)
  },

  getPost(slug: string): Promise<Post> {
    return request(`/api/posts/${encodeURIComponent(slug)}`)
  },

  /** Posts publicados da categoria simulator (página de Simuladores). */
  getSimulators(): Promise<{ category: string; posts: PostSummary[] }> {
    return request('/api/posts/simulators')
  },

  createPost(input: PostInput): Promise<CreatePostResult> {
    return request('/api/posts/admin', {
      method: 'POST',
      body: JSON.stringify(input)
    })
  },

  updatePost(id: string, input: Partial<PostInput>): Promise<CreatePostResult> {
    return request(`/api/posts/admin/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(input)
    })
  },

  submitForReview(id: string): Promise<{ id: string; status: 'review' }> {
    return request(`/api/posts/admin/${encodeURIComponent(id)}/submit`, { method: 'POST' })
  },

  publish(id: string): Promise<{ id: string; publishedAt: string }> {
    return request(`/api/posts/admin/${encodeURIComponent(id)}/publish`, { method: 'POST' })
  },

  archive(id: string): Promise<{ id: string; status: 'archived' }> {
    return request(`/api/posts/admin/${encodeURIComponent(id)}/archive`, { method: 'POST' })
  }
}
