// Path: apps/web/src/components/deck-card.tsx
// View pura: card de deck (lista/grid e feed da comunidade). Sem hooks de dados.
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ATTRIBUTE_COLORS, type AttributeColor } from './attribute-colors'
import { Copy } from './icons'

export type DeckCardData = {
  name: string
  colors: AttributeColor[]
  meta?: string
  likeCount?: number
  copyCount?: number
  liked?: boolean
  legal?: boolean
}

export type DeckCardProps = {
  deck: DeckCardData
  /** Quando presente, o título vira link (evita botões aninhados em <a>). */
  href?: string
  onCopy?: () => void
  onLike?: () => void
  likePending?: boolean
  className?: string
}

export function DeckCard({ deck, href, onCopy, onLike, likePending, className }: DeckCardProps) {
  const showStats =
    onLike !== undefined || deck.likeCount !== undefined || deck.copyCount !== undefined

  return (
    <article className={cn('flex flex-col gap-3 border border-border bg-surface p-4', className)}>
      <div className="flex items-center gap-3">
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
          {href ? (
            <Link
              href={href}
              className="truncate font-display text-base font-bold text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {deck.name}
            </Link>
          ) : (
            <h3 className="truncate font-display text-base font-bold text-ink">{deck.name}</h3>
          )}
          {deck.meta ? <p className="truncate text-[13px] text-ink-soft">{deck.meta}</p> : null}
        </div>
        {deck.legal !== undefined ? (
          <span
            className={cn(
              'shrink-0 px-2 py-[3px] text-[11px] font-semibold',
              deck.legal ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
            )}
          >
            {deck.legal ? 'Legal' : 'Ilegal'}
          </span>
        ) : null}
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
      </div>

      {showStats ? (
        <div className="flex items-center gap-4 border-t border-border pt-3 text-[13px] text-ink-soft">
          {onLike ? (
            <button
              type="button"
              onClick={onLike}
              disabled={likePending}
              aria-pressed={deck.liked ?? false}
              aria-label={deck.liked ? `Descurtir ${deck.name}` : `Curtir ${deck.name}`}
              className={cn(
                'inline-flex min-h-8 items-center gap-1.5 font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                'disabled:pointer-events-none disabled:opacity-50',
                deck.liked ? 'text-primary' : 'text-ink-soft hover:text-ink'
              )}
            >
              <Heart className={cn('size-4', deck.liked && 'fill-current')} />
              {deck.likeCount ?? 0}
            </button>
          ) : deck.likeCount !== undefined ? (
            <span className="inline-flex items-center gap-1.5">
              <Heart className="size-4" />
              {deck.likeCount}
            </span>
          ) : null}
          {deck.copyCount !== undefined ? (
            <span className="inline-flex items-center gap-1.5">
              <Copy className="size-4" />
              {deck.copyCount}
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
