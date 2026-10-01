// Path: apps/web/src/features/content/viewmodels/use-post-actions.ts
// ViewModel: ações de workflow editorial (submit / publish / archive).
// O backend revalida as permissões (somente Admin/Editor publicam/arquivam).
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { contentApi } from '../model/api'

export type PostAction = 'submit' | 'publish' | 'archive'

export function usePostActions(id: string) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['posts'] })
    void queryClient.invalidateQueries({ queryKey: ['post'] })
  }

  const submit = useMutation({
    mutationFn: () => contentApi.submitForReview(id),
    onSuccess: invalidate
  })

  const publish = useMutation({
    mutationFn: () => contentApi.publish(id),
    onSuccess: invalidate
  })

  const archive = useMutation({
    mutationFn: () => contentApi.archive(id),
    onSuccess: invalidate
  })

  return {
    submit,
    publish,
    archive,
    isPending: submit.isPending || publish.isPending || archive.isPending
  }
}
