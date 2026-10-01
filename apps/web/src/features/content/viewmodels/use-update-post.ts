// Path: apps/web/src/features/content/viewmodels/use-update-post.ts
// ViewModel: edição de post (autor ou Admin/Editor). Invalida post + listagens.
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { contentApi } from '../model/api'
import type { PostInput } from '../model/types'

export function useUpdatePost(id: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (input: Partial<PostInput>) => contentApi.updatePost(id, input),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] })
      void queryClient.invalidateQueries({ queryKey: ['post', result.slug] })
    }
  })

  return {
    updatePost: mutation.mutate,
    updatePostAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset
  }
}
