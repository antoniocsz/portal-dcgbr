// Path: apps/web/src/components/card-hover-card.tsx
// Design system: preview flutuante (hovercard) com a arte grande da carta.
// Abre no hover/focus do gatilho em ponteiros finos (desktop) e some ao sair.
// Só estado local de UI — sem dados de rede; o preview não intercepta cliques.
'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode
} from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ATTRIBUTE_COLORS, ATTRIBUTE_LABELS, type AttributeColor } from './attribute-colors'
import { Sparkles } from './icons'

export interface CardHoverCardData {
  name: string
  number: string
  color: AttributeColor
  imageUrl?: string | null | undefined
}

export interface CardHoverCardProps {
  card: CardHoverCardData
  children: ReactNode
  className?: string
}

const PREVIEW_WIDTH = 280
const PREVIEW_CHROME = 44
const GAP = 12

function computePosition(rect: DOMRect): { left: number; top: number } {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const previewHeight = Math.round((PREVIEW_WIDTH * 7) / 5) + PREVIEW_CHROME
  const spaceRight = viewportWidth - rect.right
  const spaceLeft = rect.left
  const opensRight = spaceRight >= PREVIEW_WIDTH + GAP || spaceRight >= spaceLeft
  const rawLeft = opensRight ? rect.right + GAP : rect.left - PREVIEW_WIDTH - GAP
  const left = Math.max(GAP, Math.min(rawLeft, viewportWidth - PREVIEW_WIDTH - GAP))
  const rawTop = rect.top + rect.height / 2 - previewHeight / 2
  const top = Math.max(GAP, Math.min(rawTop, viewportHeight - previewHeight - GAP))
  return { left, top }
}

function CardPreview({ card }: { card: CardHoverCardData }) {
  const [imageFailed, setImageFailed] = useState(false)
  const hex = ATTRIBUTE_COLORS[card.color]
  const colorLabel = ATTRIBUTE_LABELS[card.color]
  const showArt = Boolean(card.imageUrl) && !imageFailed

  return (
    <div className="overflow-hidden border border-border bg-surface shadow-2xl shadow-black/60">
      <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: hex }}>
        <span className="truncate font-display text-sm font-bold text-white">{card.name}</span>
      </div>
      <div
        className="relative aspect-[5/7] w-full overflow-hidden"
        style={{ backgroundImage: `linear-gradient(0deg, ${hex} 0%, ${hex}99 100%)` }}
      >
        {showArt ? (
          <>
            <Image
              src={card.imageUrl ?? ''}
              alt=""
              fill
              sizes="280px"
              onError={() => setImageFailed(true)}
              className="object-contain"
            />
            <span className="absolute left-2.5 top-2.5 bg-black/60 px-1.5 py-0.5 text-[11px] font-bold text-white">
              {card.number}
            </span>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
            <Sparkles className="size-12 text-white/90" />
            <span className="font-display text-base font-bold text-white">{card.name}</span>
            <span className="text-xs font-bold text-white/90">{card.number}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <span className="text-[11px] text-ink-faint">{colorLabel}</span>
      </div>
    </div>
  )
}

export function CardHoverCard({ card, children, className }: CardHoverCardProps) {
  const triggerRef = useRef<HTMLDivElement>(null)
  const [canHover, setCanHover] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null)

  useEffect(() => {
    const query = window.matchMedia('(pointer: fine)')
    const update = () => setCanHover(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  const open = canHover && (hovered || focused)

  useEffect(() => {
    if (!open) {
      setPosition(null)
      return
    }
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) setPosition(computePosition(rect))
    const hide = () => setPosition(null)
    window.addEventListener('scroll', hide, true)
    window.addEventListener('resize', hide)
    return () => {
      window.removeEventListener('scroll', hide, true)
      window.removeEventListener('resize', hide)
    }
  }, [open])

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      setHovered(false)
      setFocused(false)
    }
  }, [])

  return (
    <div
      ref={triggerRef}
      className={cn('relative', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={handleKeyDown}
    >
      {children}
      {position
        ? createPortal(
          <div
            aria-hidden="true"
            className="pointer-events-none fixed z-50"
            style={{ left: position.left, top: position.top, width: PREVIEW_WIDTH }}
          >
            <CardPreview card={card} />
          </div>,
          document.body
        )
        : null}
    </div>
  )
}
