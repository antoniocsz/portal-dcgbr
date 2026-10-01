// Path: apps/web/src/features/cards/views/card-detail-view.tsx
// View da ficha de carta (design "Ficha da Carta"): carta grande, chips,
// grid de stats, efeito, set e cadeia de digievolução. Dados vêm do
// ViewModel useCard — View só renderiza.
'use client'

import Link from 'next/link'
import { Button, Sparkles } from '@/components'
import { attributeColor, attributeHex, toCardDetailView } from '../viewmodels/card-view'
import { useCard } from '../viewmodels/use-card'
import type { CardColor } from '../model/types'

// Hex oficiais das cores de carta (dcg.pen — chips do Card Database).
const CARD_COLOR_HEX: Record<CardColor, string> = {
  red: '#dc2626',
  blue: '#3b82f6',
  yellow: '#e5b93b',
  green: '#22c55e',
  purple: '#a855f7',
  black: '#3a3f4a',
  white: '#ffffff'
}

export interface CardDetailViewProps {
  id: string
}

function StatBox({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 border border-border bg-surface p-3.5">
      <span className="text-xs text-ink-faint">{label}</span>
      <span className="font-display text-lg font-bold text-ink lg:text-xl">{value ?? '—'}</span>
    </div>
  )
}

function EvoNode({ level, label }: { level: string; label: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-0.5 border border-border bg-surface px-2.5 py-2">
      <span className="text-[11px] font-bold text-primary">{level}</span>
      <span className="text-[13px] font-bold text-ink">{label}</span>
    </div>
  )
}

export function CardDetailView({ id }: CardDetailViewProps) {
  const { card, isLoading, isError, refetch } = useCard(id)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-10 lg:px-12" aria-busy="true" aria-label="Carregando carta">
        <div className="h-72 animate-pulse border border-border bg-surface-2" />
      </div>
    )
  }

  if (isError || !card) {
    return (
      <div className="mx-auto flex max-w-[1000px] flex-col items-center gap-4 px-4 py-16 text-center lg:px-12">
        <p className="text-sm text-ink-soft">Carta não encontrada.</p>
        <Button variant="dark" size="sm" onClick={refetch}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  const detail = toCardDetailView(card)
  const color = attributeColor(card)
  const hex = attributeHex(color)

  return (
    <article className="mx-auto w-full max-w-[1000px] px-4 py-10 lg:px-12">
      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center lg:gap-12">
        {/* Carta grande */}
        <div
          className="w-full max-w-[400px] shrink-0 overflow-hidden border-2 bg-surface"
          style={{ borderColor: hex }}
        >
          <div className="flex items-center justify-between bg-[#dc2626] px-4 py-3.5" style={{ backgroundColor: hex }}>
            <h2 className="truncate font-display text-2xl font-bold text-white">{detail.name}</h2>
            {detail.level ? (
              <span className="shrink-0 text-sm font-bold text-white/90">◆ Lv.{detail.level}</span>
            ) : null}
          </div>
          <div
            className="relative flex h-72 flex-col items-center justify-center gap-2.5"
            style={{ backgroundImage: `linear-gradient(0deg, ${hex} 0%, ${hex}99 100%)` }}
          >
            {detail.imageUrl ? (
              <img src={detail.imageUrl} alt={`Arte da carta ${detail.name}`} className="h-full w-full object-cover" />
            ) : (
              <Sparkles className="size-24 text-white/90" aria-hidden="true" />
            )}
            <span className="absolute bottom-3 text-[13px] font-bold text-white/85">
              {detail.number} · {detail.rarity}
            </span>
          </div>
          <div className="flex items-center justify-between bg-surface-2 px-4 py-3">
            <span className="font-display text-[22px] font-bold text-ink">{detail.dp ?? ''}</span>
            <span className="text-sm font-semibold text-ink-soft">{detail.attribute ?? ''}</span>
          </div>
        </div>

        {/* Coluna de informações */}
        <div className="flex w-full max-w-[560px] flex-col gap-3.5">
          <p className="text-[13px] font-bold text-ink-faint">
            {detail.number} · {detail.rarity}
          </p>
          <h1 className="font-display text-4xl font-bold text-ink">{detail.name}</h1>

          <div className="flex flex-wrap items-center gap-2.5">
            {detail.colorChips.map((chip) => (
              <span
                key={chip.color}
                className="inline-flex items-center gap-1.5 border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink"
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: CARD_COLOR_HEX[chip.color] }}
                  aria-hidden="true"
                />
                {chip.label}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: hex }} aria-hidden="true" />
              {detail.typeLabel}
              {detail.digiType ? ` · ${detail.digiType}` : ''}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBox label="Nível" value={detail.level} />
            <StatBox label="Custo" value={detail.playCost} />
            <StatBox label="DP" value={detail.dpNumber != null ? String(detail.dpNumber) : null} />
            <StatBox label="Atributo" value={detail.attribute} />
          </div>

          {detail.effects ? (
            <div className="flex flex-col gap-2 border border-border bg-surface p-4">
              <h2 className="text-sm font-bold text-ink">Efeito</h2>
              <p className="text-sm leading-6 text-ink-soft">{detail.effects}</p>
            </div>
          ) : null}

          {detail.setCode ? (
            <div className="flex items-center gap-2.5 bg-surface-2 px-3.5 py-3">
              <p className="text-[13px] text-ink-soft">
                {detail.setCode}
                {detail.releaseLabel ? ` · ${detail.releaseLabel}` : ''}
              </p>
            </div>
          ) : null}

          {detail.evolutionConditions.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 bg-primary-soft px-3.5 py-3">
              <span className="text-[13px] font-bold text-primary">Digievolução:</span>
              {detail.evolutionConditions.map((condition, index) => (
                <span key={`${condition.color}-${condition.level}-${index}`} className="flex items-center gap-2">
                  <EvoNode
                    level={`Lv.${condition.level}`}
                    label={`${condition.colorLabel} · custo ${condition.cost}`}
                  />
                  {index < detail.evolutionConditions.length - 1 ? (
                    <span className="text-primary" aria-hidden="true">→</span>
                  ) : null}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="pt-10 text-center">
        <Link href="/cartas" className="text-sm font-semibold text-primary hover:underline">
          ← Voltar para o card database
        </Link>
      </div>
    </article>
  )
}
