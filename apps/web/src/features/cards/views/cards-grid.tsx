// Path: apps/web/src/features/cards/views/cards-grid.tsx
// View presentacional: grade de cartas (CardTile do design system) com link
// para a ficha, controles de paginação e estados de loading/erro/vazio.
// Sem hooks de dados.
import Link from 'next/link'
import { Button, CardTile, type CardTileData } from '@/components'

export type GridCard = CardTileData & { id: string }

export interface CardsGridProps {
  cards: GridCard[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  emptyMessage?: string
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

function GridSkeleton() {
  return (
    <div
      className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-busy="true"
      aria-label="Carregando cartas"
    >
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="h-72 animate-pulse border border-border bg-surface-2" />
      ))}
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onPageChange
}: {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-3 pt-8"
      aria-label="Paginação do catálogo"
    >
      <Button
        variant="dark"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Anterior
      </Button>
      <span className="text-[13px] text-ink-soft">
        Página <span className="font-semibold text-ink">{page}</span> de {totalPages}
      </span>
      <Button
        variant="dark"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Próxima →
      </Button>
    </nav>
  )
}

export function CardsGrid({
  cards,
  isLoading = false,
  isError = false,
  onRetry,
  emptyMessage = 'Nenhuma carta encontrada.',
  page = 1,
  totalPages = 1,
  onPageChange
}: CardsGridProps) {
  if (isLoading) return <GridSkeleton />

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 border border-border bg-surface px-6 py-12 text-center">
        <p className="text-sm text-ink-soft">Não foi possível carregar o catálogo.</p>
        {onRetry ? (
          <Button variant="dark" size="sm" onClick={onRetry}>
            Tentar novamente
          </Button>
        ) : null}
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="border border-border bg-surface px-6 py-12 text-center">
        <p className="text-sm text-ink-soft">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.id}
            href={`/cartas/${card.id}`}
            className="block transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <CardTile card={card} />
          </Link>
        ))}
      </div>
      {onPageChange ? (
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      ) : null}
    </>
  )
}
