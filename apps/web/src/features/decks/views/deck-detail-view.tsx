// Path: apps/web/src/features/decks/views/deck-detail-view.tsx
// View do detalhe de um deck: dados, cardList, ações do dono (publicar/excluir)
// e copiar para Member logado. Controlada pelos ViewModels (sem dados diretos).
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, StatusBadge, Tag } from '@/components'
import { statusLabel } from '../viewmodels/deck-view'
import { useDeck } from '../viewmodels/use-deck'
import { useCopyDeck, useDeleteDeck, usePublishDeck } from '../viewmodels/use-deck-actions'
import type { StatusTone } from '@/components'

function statusTone(status: string): StatusTone {
  return status === 'published' ? 'success' : 'warning'
}

export interface DeckDetailViewProps {
  slug: string
  isOwner?: boolean
}

export function DeckDetailView({ slug, isOwner = false }: DeckDetailViewProps) {
  const router = useRouter()
  const { deck, isLoading, isError, error, refetch } = useDeck(slug)
  const publish = usePublishDeck()
  const remove = useDeleteDeck()
  const copy = useCopyDeck()

  const errorMessage = error instanceof Error ? error.message : null

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true" aria-label="Carregando deck">
        <div className="h-10 w-2/3 animate-pulse bg-surface-2" />
        <div className="h-4 w-1/2 animate-pulse bg-surface-2" />
        <div className="h-64 animate-pulse bg-surface-2" />
      </div>
    )
  }

  if (isError || !deck) {
    return (
      <div className="flex flex-col items-center gap-4 border border-border bg-surface px-6 py-12 text-center">
        <p className="text-sm text-ink-soft">{errorMessage ?? 'Não foi possível carregar o deck.'}</p>
        <Button variant="dark" size="sm" onClick={() => void refetch()}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  const totalCards = deck.cardList.reduce((sum, entry) => sum + entry.quantity, 0)

  return (
    <article className="mx-auto w-full max-w-[1440px] px-4 py-10 lg:px-12">
      <header className="flex flex-col gap-2.5 pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            {deck.name}
          </h1>
          <StatusBadge tone={statusTone(deck.status)}>{statusLabel(deck.status)}</StatusBadge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tag>{deck.format}</Tag>
          <Tag>{totalCards} cartas</Tag>
        </div>
        {deck.description ? (
          <p className="max-w-3xl text-base leading-6 text-ink-soft">{deck.description}</p>
        ) : null}
      </header>

      {publish.isError || remove.isError || copy.isError ? (
        <p role="alert" className="pb-4 text-xs font-semibold text-danger">
          {publish.error instanceof Error ? publish.error.message : null}
          {remove.error instanceof Error ? remove.error.message : null}
          {copy.error instanceof Error ? copy.error.message : null}
        </p>
      ) : null}

      {isOwner ? (
        <div className="flex flex-wrap gap-3 pb-8">
          {deck.status === 'draft' ? (
            <Button
              variant="primary"
              size="sm"
              disabled={publish.isPending}
              onClick={() => publish.mutate(deck.slug)}
            >
              {publish.isPending ? 'Publicando…' : 'Publicar deck'}
            </Button>
          ) : null}
          <Button
            variant="dark"
            size="sm"
            disabled={remove.isPending}
            onClick={() => {
              remove.mutate(deck.slug, {
                onSuccess: () => router.push('/decks')
              })
            }}
          >
            {remove.isPending ? 'Excluindo…' : 'Excluir deck'}
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 pb-8">
          <Button
            variant="primary"
            size="sm"
            disabled={copy.isPending}
            onClick={() => copy.mutate(deck.slug)}
          >
            {copy.isPending ? 'Copiando…' : 'Copiar deck'}
          </Button>
        </div>
      )}

      <section aria-label="Lista de cartas">
        <h2 className="pb-3 font-display text-xl font-bold text-ink">Cartas</h2>
        {deck.cardList.length === 0 ? (
          <p className="border border-border bg-surface px-4 py-8 text-center text-sm text-ink-soft">
            Este deck ainda não tem cartas.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {deck.cardList.map((entry) => (
              <li
                key={entry.cardId}
                className="flex items-center justify-between border border-border bg-surface px-4 py-3 text-sm text-ink"
              >
                <span className="min-w-0 truncate">{entry.cardId}</span>
                <span className="shrink-0 text-ink-soft">×{entry.quantity}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="pt-8">
        <Link href="/decks" className="text-sm font-semibold text-primary hover:underline">
          ← Voltar para decks
        </Link>
      </div>
    </article>
  )
}
