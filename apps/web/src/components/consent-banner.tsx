// Path: apps/web/src/components/consent-banner.tsx
// View pura (client): banner de consentimento de cookies (LGPD). Consome o
// ViewModel useConsent — a View só renderiza (sem fetch nem formulário).
'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { useConsent } from '@/features/consent/viewmodels'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'

interface ToggleSwitchProps {
  id: string
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange?: (next: boolean) => void
}

function ToggleSwitch({ id, label, description, checked, disabled, onChange }: ToggleSwitchProps) {
  const labelId = `${id}-label`
  const descId = `${id}-desc`

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <span id={labelId} className="text-sm font-semibold text-ink">
          {label}
        </span>
        <span id={descId} className="max-w-prose text-xs leading-5 text-ink-soft">
          {description}
        </span>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={descId}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative mt-0.5 h-6 w-11 shrink-0 border transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
          checked ? 'border-primary bg-primary' : 'border-border bg-surface-2',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-1/2 size-4 -translate-y-1/2 bg-ink transition-all',
            checked ? 'left-6' : 'left-1'
          )}
        />
      </button>
    </div>
  )
}

export function ConsentBanner() {
  const { consent, hasDecided, acceptAll, rejectNonEssential, savePreferences } = useConsent()
  const [showPreferences, setShowPreferences] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [ads, setAds] = useState(false)

  const openPreferences = useCallback(() => {
    setAnalytics(consent?.analytics ?? false)
    setAds(consent?.ads ?? false)
    setShowPreferences(true)
  }, [consent])

  const closePreferences = useCallback(() => {
    setShowPreferences(false)
  }, [])

  const handleSave = useCallback(() => {
    savePreferences({ analytics, ads })
    setShowPreferences(false)
  }, [analytics, ads, savePreferences])

  if (hasDecided) return null

  if (showPreferences) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-prefs-title"
        className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 p-0 sm:items-center sm:p-4"
      >
        <div className="w-full max-w-lg border border-border bg-surface p-5 sm:p-6">
          <h2 id="consent-prefs-title" className="font-display text-lg font-bold text-ink">
            Preferências de cookies
          </h2>
          <p className="mt-2 text-sm leading-5 text-ink-soft">
            Escolha quais cookies não essenciais você autoriza. Você pode mudar isso depois na{' '}
            <Link href="/cookies" className="font-semibold text-accent underline underline-offset-2">
              Política de Cookies
            </Link>.
          </p>

          <div className="mt-5 flex flex-col gap-5">
            <ToggleSwitch
              id="consent-essential"
              label="Essenciais (sempre ativos)"
              description="Necessários para o site funcionar, como manter você autenticado. Não dependem de consentimento."
              checked
              disabled
            />
            <ToggleSwitch
              id="consent-analytics"
              label="Análise e métricas"
              description="Ajudam a entender como o site é usado para melhorar a experiência."
              checked={analytics}
              onChange={setAnalytics}
            />
            <ToggleSwitch
              id="consent-ads"
              label="Publicidade"
              description="Permitem anúncios mais relevantes e a medição do desempenho deles."
              checked={ads}
              onChange={setAds}
            />
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={closePreferences}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Salvar preferências
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      role="region"
      aria-labelledby="consent-title"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface"
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-12">
        <div className="flex flex-col gap-1">
          <p id="consent-title" className="font-display text-sm font-bold text-ink">
            Cookies e privacidade
          </p>
          <p className="max-w-2xl text-[13px] leading-5 text-ink-soft">
            Usamos cookies essenciais para o site funcionar. Cookies de análise e publicidade só
            são ativados com o seu consentimento. Saiba mais na{' '}
            <Link href="/cookies" className="font-semibold text-accent underline underline-offset-2">
              Política de Cookies
            </Link>.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Button variant="primary" size="sm" onClick={acceptAll}>
            Aceitar todos
          </Button>
          <Button variant="dark" size="sm" onClick={rejectNonEssential}>
            Rejeitar não essenciais
          </Button>
          <Button variant="ghost" size="sm" onClick={openPreferences}>
            Preferências
          </Button>
        </div>
      </div>
    </div>
  )
}
