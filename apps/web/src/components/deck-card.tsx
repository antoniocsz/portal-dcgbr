// Path: apps/web/src/components/deck-card.tsx
// View pura: card de deck (lista/grid). Sem hooks de dados.
import { cn } from '@/lib/utils'
import { ATTRIBUTE_COLORS, type AttributeColor } from './attribute-colors'
import { Copy } from './icons'

export type DeckCardData = {
  name: string
  colors: AttributeColor[]
  meta?: string
}

export type DeckCardProps = {
  deck: DeckCardData
  onCopy?: () => void
  className?: string
}

export function DeckCard({ deck, onCopy, className }: DeckCardProps) {
  return (
    <article className={cn('flex items-center gap-3 border border-border bg-surface p-4', className)}>
      <div className="flex shrink-0 gap-1.5">
        {deck.colors.map((color, index) => (
          <span
            key={`${color}-${index}`}
            className="size-3.5 rounded-full"
            style={{ backgroundColor: ATTRIBUTE_COLORS[color] }}
          />
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h3 className="truncate font-display text-base font-bold text-ink">{deck.name}</h3>
        {deck.meta ? <p className="truncate text-[13px] text-ink-soft">{deck.meta}</p> : null}
      </div>
      {onCopy ? (
        <button
          type="button"
          onClick={onCopy}
          aria-label={`Copiar deck ${deck.name}`}
          className="shrink-0 text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <Copy className="size-5" />
        </button>
      ) : null}
    </article>
  )
}
