// Path: apps/web/src/features/content/viewmodels/use-news-list.ts
// ViewModel da listagem pública de notícias, com filtro opcional por categoria.
'use client'

import type { PostCategory } from '../model/types'
import { toPostCardData } from './post-view'
import { usePostList } from './use-post-list'

const PAGE_SIZE = 24

export function useNewsList(category?: PostCategory) {
  const params = category
    ? { category, page: 1, pageSize: PAGE_SIZE }
    : { page: 1, pageSize: PAGE_SIZE }
  const { posts, total, isLoading, isError, refetch } = usePostList(params)

  return {
    posts: posts.map(toPostCardData),
    total,
    isLoading,
    isError,
    refetch: () => {
      void refetch()
    }
  }
}
