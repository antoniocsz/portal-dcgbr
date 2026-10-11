// Path: apps/web/src/features/content/model/api.ts
// Repository da feature: chamadas à API separada (ADR-007) via @digimon/api-client.
// Sem hooks, sem JSX — camada Model do MVVM estrito.
import { apiClient } from '@/lib/api-base'
import type { CreatePostResult, ListPostsParams, Paginated, Post, PostInput, PostSummary } from './types'

export { ApiError } from '@digimon/api-client'

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
    return apiClient.get(`/posts${buildQuery(params)}`)
  },

  getPost(slug: string): Promise<Post> {
    return apiClient.get(`/posts/${encodeURIComponent(slug)}`)
  },

  /** Posts publicados da categoria simulator (página de Simuladores). */
  getSimulators(): Promise<{ category: string; posts: PostSummary[] }> {
    return apiClient.get('/posts/simulators')
  },

  createPost(input: PostInput): Promise<CreatePostResult> {
    return apiClient.post('/posts/admin', input)
  },

  updatePost(id: string, input: Partial<PostInput>): Promise<CreatePostResult> {
    return apiClient.patch(`/posts/admin/${encodeURIComponent(id)}`, input)
  },

  submitForReview(id: string): Promise<{ id: string; status: 'review' }> {
    return apiClient.post(`/posts/admin/${encodeURIComponent(id)}/submit`)
  },

  publish(id: string): Promise<{ id: string; publishedAt: string }> {
    return apiClient.post(`/posts/admin/${encodeURIComponent(id)}/publish`)
  },

  archive(id: string): Promise<{ id: string; status: 'archived' }> {
    return apiClient.post(`/posts/admin/${encodeURIComponent(id)}/archive`)
  }
}
