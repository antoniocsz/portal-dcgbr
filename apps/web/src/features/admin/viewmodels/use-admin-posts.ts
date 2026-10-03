// Path: apps/web/src/features/admin/viewmodels/use-admin-posts.ts
// ViewModels do painel admin de posts (task 17):
// - useAdminPosts: listagem editorial via GET /api/posts/admin com filtro de
//   status, paginação e ações de workflow (submit/publish/archive).
// - useAdminPostForm: carrega o post em edição por id via GET /api/posts/admin/:id
//   (qualquer status — draft/review/published/archived — para editorial).
//   A composição com usePostForm/usePostActions acontece na View (remount por key).
'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi, type EditorialPostSummary } from '../model/admin-api'
import type { AdminPostStatusFilter } from '../model/types'
import { contentApi } from '@/features/content/model/api'
import type { Post, PostStatus } from '@/features/content/model/types'
import type { PostFormValues } from '@/features/content/viewmodels/use-post-form'

const ADMIN_PAGE_SIZE = 20
const EDITORIAL_STATUSES: PostStatus[] = ['draft', 'review', 'published', 'archived']

interface PostsPage {
  items: EditorialPostSummary[]
  total: number
  page: number
  pageSize: number
}

async function fetchPosts(status: AdminPostStatusFilter, page: number): Promise<PostsPage> {
  if (status === 'all') {
    // A API exige um status na listagem editorial; "Todos" consolida os 4
    // statuses em paralelo e ordena por updatedAt (mais recente primeiro).
    const results = await Promise.all(
      EDITORIAL_STATUSES.map((item) =>
        adminApi.listEditorialPosts({ status: item, page, pageSize: ADMIN_PAGE_SIZE })
      )
    )
    return {
      items: results
        .flatMap((result) => result.items)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      total: results.reduce((sum, result) => sum + result.total, 0),
      page,
      pageSize: ADMIN_PAGE_SIZE
    }
  }
  return adminApi.listEditorialPosts({ status, page, pageSize: ADMIN_PAGE_SIZE })
}

/** Mapeia o Post completo (GET /api/posts/admin/:id) para os valores do formulário. */
export function toPostFormValues(post: Post): PostFormValues {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? '',
    body: post.body,
    coverImage: post.coverImage ?? '',
    externalUrl: post.externalUrl ?? '',
    category: post.category
  }
}

export function useAdminPosts() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<AdminPostStatusFilter>('all')
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: ['admin-posts', status, page],
    queryFn: () => fetchPosts(status, page)
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-posts'] })
  }

  const publish = useMutation({
    mutationFn: (id: string) => adminApi.publishPost(id),
    onSuccess: invalidate
  })
  const archive = useMutation({
    mutationFn: (id: string) => adminApi.archivePost(id),
    onSuccess: invalidate
  })
  const submit = useMutation({
    mutationFn: (id: string) => contentApi.submitForReview(id),
    onSuccess: invalidate
  })

  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE))
  const busy = publish.isPending || archive.isPending || submit.isPending

  const selectStatus = (next: AdminPostStatusFilter) => {
    setStatus(next)
    setPage(1)
  }

  return {
    rows: query.data?.items ?? [],
    total,
    page,
    totalPages,
    status,
    selectStatus,
    setPage,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    publish: publish.mutate,
    archive: archive.mutate,
    submit: submit.mutate,
    busy,
    actionError: publish.error ?? archive.error ?? submit.error
  }
}

export interface AdminPostFormData {
  post: Post
}

/**
 * Carrega o post em edição por id via GET /api/posts/admin/:id — retorna
 * qualquer status (draft/review/published/archived) para usuário editorial.
 */
export function useAdminPostForm(opts: { postId?: string } = {}) {
  const postId = opts.postId

  const query = useQuery({
    queryKey: ['admin-post', postId],
    queryFn: async (): Promise<AdminPostFormData> => {
      if (!postId) throw new Error('postId ausente')
      const post = (await adminApi.getEditorialPost(postId)) as unknown as Post
      return { post }
    },
    enabled: Boolean(postId)
  })

  return {
    data: query.data as AdminPostFormData | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  }
}
