// Path: apps/web/src/features/admin/viewmodels/use-admin-moderation-view-model.ts
// ViewModel da fila de moderação (sinalizações). Amostra do Model + ação de
// moderação ligada à API real de comentários.
'use client'

import { useCallback, useState } from 'react'
import { adminApi } from '../model/admin-api'
import { DEMO_MODERATION } from '../model/demo-data'
import type { ModerationItem } from '../model/types'

export interface AdminModerationViewModel {
  items: ModerationItem[]
  moderatingId: string | null
  hide: (id: string) => void
  keep: (id: string) => void
}

export function useAdminModerationViewModel(): AdminModerationViewModel {
  const [items, setItems] = useState<ModerationItem[]>(DEMO_MODERATION)
  const [moderatingId, setModeratingId] = useState<string | null>(null)

  const resolve = useCallback((id: string, action: 'hide' | 'show'): void => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    setModeratingId(id)
    adminApi
      .moderateComment(id, action)
      .catch(() => {
        // Amostra de demonstração: a decisão local é mantida.
      })
      .finally(() => setModeratingId(null))
  }, [])

  const hide = useCallback((id: string): void => resolve(id, 'hide'), [resolve])
  const keep = useCallback((id: string): void => resolve(id, 'show'), [resolve])

  return { items, moderatingId, hide, keep }
}
