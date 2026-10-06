// Path: apps/web/src/features/admin/viewmodels/use-site-gate.ts
// ViewModel da página de configurações do site-gate: seleção do modo
// (live | coming-soon) + ação de salvar com feedback. MVVM — a View só renderiza.
'use client'

import { useState } from 'react'
import { setSiteGateMode, type SiteGateMode } from '../model/site-gate-api'

export interface SiteGateFeedback {
  ok: boolean
  text: string
}

export function useSiteGate(initialMode: SiteGateMode) {
  const [mode, setMode] = useState<SiteGateMode>(initialMode)
  const [selected, setSelected] = useState<SiteGateMode>(initialMode)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<SiteGateFeedback | null>(null)

  const dirty = selected !== mode

  const select = (next: SiteGateMode): void => {
    setSelected(next)
    setFeedback(null)
  }

  const save = async (): Promise<void> => {
    setSaving(true)
    setFeedback(null)
    try {
      await setSiteGateMode(selected)
      setMode(selected)
      setFeedback({
        ok: true,
        text:
          selected === 'coming-soon'
            ? 'Modo "Em breve" ativado: visitantes serão redirecionados para a página de manutenção.'
            : 'Site no ar novamente.'
      })
    } catch (error) {
      setFeedback({
        ok: false,
        text: error instanceof Error ? error.message : 'Falha ao salvar a configuração.'
      })
    } finally {
      setSaving(false)
    }
  }

  return { mode, selected, dirty, saving, feedback, select, save }
}
