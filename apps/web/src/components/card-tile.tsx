// Path: apps/web/src/components/card-tile.tsx
// View: tile de carta Digimon (card database). Sem hooks de dados — apenas o
// estado local de falha da arte (para cair no gradiente + Sparkles).
'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ATTRIBUTE_COLORS, ATTRIBUTE_LABELS, type AttributeColor } from './attribute-colors'
import { Sparkles } from './icons'

export type CardTileData = {
  name: string
  number: string
  level?: string
  dp?: string
  type?: string
  color: AttributeColor
  icon?: ReactNode
  imageUrl?: string | null
}

export type CardTileProps = {
  card: CardTileData
  className?: string
}

export function CardTile({ card, className }: CardTileProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const hex = ATTRIBUTE_COLORS[card.color]
  const colorLabel = ATTRIBUTE_LABELS[card.color]
  const subtitle = [card.type, colorLabel].filter(Boolean).join(' · ')
  const showArt = Boolean(card.imageUrl) && !imageFailed

  return (
    <article className={cn('flex flex-col overflow-hidden border border-border bg-surface', className)}>
      <div className="flex items-center justify-between px-2.5 py-2.5" style={{ backgroundColor: hex }}>
        <h3 className="truncate font-display text-[13px] font-bold text-white">{card.name}</h3>
      </div>
      <div
        className="relative aspect-[5/7] w-full overflow-hidden"
        style={{ backgroundImage: `linear-gradient(0deg, ${hex} 0%, ${hex}99 100%)` }}
      >
        {showArt ? (
          <>
            <img
              src={card.imageUrl ?? ''}
              alt={`Arte da carta ${card.name}`}
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover"
            />
            <span className="absolute left-2.5 top-2.5 bg-black/60 px-1.5 py-0.5 text-[11px] font-bold text-white">
              {card.number}
            </span>
            {card.level ? (
              <span className="absolute bottom-2.5 left-2.5 w-fit bg-white px-2 py-1 text-[11px] font-bold text-[#17191f]">
                {card.level}
              </span>
            ) : null}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col justify-between p-3">
            <span className="text-[11px] font-bold text-white/90">{card.number}</span>
            <div className="flex justify-center">{card.icon ?? <Sparkles className="size-11 text-white/90" />}</div>
            {card.level ? (
              <span className="w-fit bg-white px-2 py-1 text-[11px] font-bold text-[#17191f]">{card.level}</span>
            ) : null}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 p-2.5">
        <span className="font-display text-sm font-bold text-ink">{card.dp ?? ''}</span>
        <span className="text-[10px] text-ink-faint">{subtitle}</span>
      </div>
    </article>
  )
}
