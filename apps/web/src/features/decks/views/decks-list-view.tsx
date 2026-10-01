// Path: apps/web/src/features/decks/views/decks-list-view.tsx
// View da listagem de decks: grid responsivo de DeckCard (2 colunas mobile,
// multi no desktop) com copiar direto no card, estados de loading/erro/vazio
// e ação opcional no cabeçalho (ex: "+ Novo deck"). Modo "meus decks" (mine).
'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { Button, DeckCard } from '@/components'
import type { DeckSummary, ListDecksParams } from '../model/types'
import { toDeckCardData } from '../viewmodels/deck-view'
import { useDeckList } from '../viewmodels/use-deck-list'
import { useCopyDeck } from '../viewmodels/use-deck-actions'

export interface DecksListViewProps {
  mine?: boolean
  title?: string
  description?: string
  emptyMessage?: string
  pageSize?: number
  headerAction?: ReactNode
}

export function DecksListView({
  mine = false,
  title = 'Decks',
  description =
  'Deckbuilder colaborativo: monte, salve, copie e compartilhe decks do Digimon TCG Brasil.',
  emptyMessage = 'Nenhum deck encontrado.',
  pageSize = 20,
  headerAction
}: DecksListViewProps) {
  const params: ListDecksParams = { mine, pageSize }
  const { decks, total, isLoading, isError, refetch } = useDeckList(params)
  const copy = useCopyDeck()

  const handleCopy = (slug: string) => {
    copy.mutate(slug)
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10 lg:px-12">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-6">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl lg:text-[40px]">
            {title}
          </h1>
          <p className="max-w-3xl text-base leading-6 text-ink-soft">{description}</p>
        </div>
        {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
      </header>

      <p className="pb-4 text-[13px] text-ink-faint" aria-live="polite">
        {isLoading ? 'Carregando…' : `${total} decks`}
      </p>

      {isLoading ? (
        <div
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          aria-busy="true"
          aria-label="Carregando decks"
        >
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="flex h-20 items-center gap-3 border border-border bg-surface p-4">
              <div className="flex gap-1.5">
                <div className="size-3.5 animate-pulse rounded-full bg-surface-2" />
                <div className="size-3.5 animate-pulse rounded-full bg-surface-2" />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-1/2 animate-pulse bg-surface-2" />
                <div className="h-3 w-1/3 animate-pulse bg-surface-2" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-4 border border-border bg-surface px-6 py-12 text-center">
          <p className="text-sm text-ink-soft">Não foi possível carregar os decks.</p>
          <Button variant="dark" size="sm" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : decks.length === 0 ? (
        <div className="border border-border bg-surface px-6 py-12 text-center">
          <p className="text-sm text-ink-soft">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {decks.map((deck: DeckSummary) => (
            <Link
              key={deck.id}
              href={`/decks/${deck.slug}`}
              className="block transition-colors hover:border-primary/60"
            >
              <DeckCard
                deck={toDeckCardData(deck)}
                {...(mine ? {} : { onCopy: () => handleCopy(deck.slug) })}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
