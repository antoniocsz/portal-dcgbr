// Path: apps/web/src/features/content/viewmodels/use-create-post.ts
// ViewModel: criação de rascunho. Invalida listagens após sucesso.
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { contentApi } from '../model/api'
import type { CreatePostResult, PostInput } from '../model/types'

export function useCreatePost() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (input: PostInput) => contentApi.createPost(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
  })

  return {
    createPost: mutation.mutate,
    createPostAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data as CreatePostResult | undefined,
    reset: mutation.reset
  }
}
