// apps/web/src/features/comments/viewmodels/use-comments.ts
// ViewModel — orquestra dados e ações de comentários. A View depende apenas deste hook
// (MVVM estrito: View sem useQuery/useMutation).

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createComment,
  deleteComment,
  listComments,
  moderateComment,
  type CommentTargetType,
  updateComment
} from '../model/comments-api'

export interface UseCommentsOptions {
  targetType: CommentTargetType
  targetId: string
}

export function useComments({ targetType, targetId }: UseCommentsOptions) {
  const queryClient = useQueryClient()
  const queryKey = ['comments', targetType, targetId]

  const commentsQuery = useQuery({
    queryKey,
    queryFn: () => listComments({ targetType, targetId }),
    enabled: Boolean(targetId)
  })

  const create = useMutation({
    mutationFn: (body: string) => createComment({ targetType, targetId, body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  })

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => updateComment(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  })

  const moderate = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'hide' | 'show' }) =>
      moderateComment(id, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  })

  return {
    comments: commentsQuery.data?.items ?? [],
    total: commentsQuery.data?.total ?? 0,
    isLoading: commentsQuery.isLoading,
    isError: commentsQuery.isError,
    error: commentsQuery.error,
    create,
    update,
    remove,
    moderate
  }
}
