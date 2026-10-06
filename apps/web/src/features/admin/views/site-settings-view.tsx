// Path: apps/web/src/features/admin/views/site-settings-view.tsx
// View da página de configurações do site (modo "em breve"). MVVM — consome o
// hook useSiteGate; sem fetch direto.
'use client'

import { Button } from '@/components'
import { cn } from '@/lib/utils'
import { useSiteGate } from '../viewmodels/use-site-gate'
import { AdminPageHeader } from './admin-page-header'

export interface SiteSettingsViewProps {
  initialMode: 'live' | 'coming-soon'
}

const OPTIONS: { value: 'live' | 'coming-soon'; label: string; description: string }[] = [
  {
    value: 'live',
    label: 'Site no ar',
    description: 'Todos os visitantes veem o conteúdo normalmente.'
  },
  {
    value: 'coming-soon',
    label: 'Em breve',
    description: 'Visitantes são redirecionados para a página de manutenção. /admin, /api, /login e /registro continuam acessíveis.'
  }
]

export function SiteSettingsView({ initialMode }: SiteSettingsViewProps) {
  const { selected, dirty, saving, feedback, select, save } = useSiteGate(initialMode)

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Configurações"
        subtitle="Preferências globais do portal."
      />

      <article className="max-w-2xl border border-border bg-surface p-5">
        <h2 className="font-display text-base font-bold text-ink">Modo de exibição do site</h2>
        <p className="mt-1 text-sm leading-5 text-ink-soft">
          Escolha entre manter o site no ar ou exibir a página "Em breve" enquanto o portal é
          preparado. A mudança vale imediatamente.
        </p>

        <div className="mt-4 flex flex-col gap-3" role="radiogroup" aria-label="Modo de exibição">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected === option.value}
              onClick={() => select(option.value)}
              className={cn(
                'flex flex-col gap-1 rounded-none border p-4 text-left transition-colors',
                selected === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-ink-faint'
              )}
            >
              <span
                className={cn(
                  'text-sm font-semibold',
                  selected === option.value ? 'text-primary' : 'text-ink'
                )}
              >
                {option.label}
              </span>
              <span className="text-[13px] leading-5 text-ink-soft">{option.description}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button size="md" disabled={!dirty || saving} onClick={save}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
          {feedback ? (
            <p
              className={cn(
                'text-[13px] font-semibold',
                feedback.ok ? 'text-success' : 'text-danger'
              )}
            >
              {feedback.text}
            </p>
          ) : null}
        </div>
      </article>

      <p className="max-w-2xl text-xs leading-5 text-ink-faint">
        Dica: ao ativar "Em breve", a página pública passa a ser /em-breve (sem indexação). O
        painel admin continua acessível em /admin para reverter quando quiser.
      </p>
    </div>
  )
}
