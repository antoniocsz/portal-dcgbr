// Path: apps/web/src/features/decks/views/deck-form-view.tsx
// View do formulário de criação de deck (Member publica direto ou salva como
// rascunho). Controlada pelo ViewModel useDeckForm — sem hooks de dados diretos.
// A busca de cartas reusa o ViewModel useCardList (feature cards): os resultados
// alimentam o cardList do deck.
'use client'

import type { ChangeEvent, ReactNode } from 'react'
import Link from 'next/link'
import { Button, Tag } from '@/components'
import { cn } from '@/lib/utils'
import { useDeckForm } from '../viewmodels/use-deck-form'
import { useCardList } from '@/features/cards/viewmodels/use-card-list'
import { toCardTileData } from '@/features/cards/viewmodels/card-view'
import type { DeckStatus } from '../model/types'

const FORMAT_SUGGESTIONS = ['Standard', 'Booster Draft', 'Sealed', 'Casual']

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  error?: string | null
  children?: ReactNode
}

function DeckField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  error,
  children
}: FieldProps) {
  const errorId = `${id}-error`
  const classes = cn(
    'h-10 w-full border bg-surface-2 px-3 text-sm text-ink outline-none transition-colors',
    'placeholder:text-ink-faint focus:border-primary',
    error ? 'border-danger' : 'border-border'
  )
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-ink-soft lg:text-[13px]">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      {children ?? (
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={classes}
        />
      )}
      {error ? (
        <p id={errorId} className="text-xs font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export interface DeckFormViewProps {
  submitLabel?: string
  onSuccess?: (slug: string) => void
}

export function DeckFormView({ submitLabel = 'Salvar deck', onSuccess }: DeckFormViewProps) {
  const {
    values,
    errors,
    cardList,
    isPending,
    error,
    result,
    handleChange,
    setStatus,
    addCard,
    removeCard,
    handleSubmit
  } = useDeckForm()
  const search = useCardList()
  const errorMessage = error instanceof Error ? error.message : null

  const submit = (status: DeckStatus) => {
    setStatus(status)
    // Revalida com o status escolhido antes de enviar.
    void handleSubmit().then((created) => {
      if (created) onSuccess?.(created.slug)
    })
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        void handleSubmit().then((created) => {
          if (created) onSuccess?.(created.slug)
        })
      }}
    >
      <DeckField
        id="deck-name"
        label="Nome do deck"
        value={values.name}
        onChange={(value) => handleChange('name', value)}
        placeholder="Ex: Agumon Rush"
        required
        error={errors.name ?? null}
      />

      <DeckField
        id="deck-slug"
        label="Slug (opcional)"
        value={values.slug}
        onChange={(value) => handleChange('slug', value)}
        placeholder="slug-seo-friendly (gerado do nome se vazio)"
        error={errors.slug ?? null}
      />

      <DeckField
        id="deck-format"
        label="Formato"
        value={values.format}
        onChange={(value) => handleChange('format', value)}
        placeholder="Ex: Standard"
        required
        error={errors.format ?? null}
      >
        <input
          id="deck-format"
          name="format"
          type="text"
          list="deck-formats"
          value={values.format}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleChange('format', event.target.value)
          }
          required
          aria-invalid={errors.format ? true : undefined}
          className={cn(
            'h-10 w-full border bg-surface-2 px-3 text-sm text-ink outline-none transition-colors',
            'placeholder:text-ink-faint focus:border-primary',
            errors.format ? 'border-danger' : 'border-border'
          )}
        />
        <datalist id="deck-formats">
          {FORMAT_SUGGESTIONS.map((format) => (
            <option key={format} value={format} />
          ))}
        </datalist>
      </DeckField>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="deck-description" className="text-xs font-semibold text-ink-soft lg:text-[13px]">
          Descrição (opcional)
        </label>
        <textarea
          id="deck-description"
          name="description"
          value={values.description}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            handleChange('description', event.target.value)
          }
          rows={4}
          placeholder="Estratégia, engine, combos…"
          className={cn(
            'w-full border bg-surface-2 px-3 py-2.5 text-sm text-ink outline-none transition-colors',
            'placeholder:text-ink-faint focus:border-primary',
            errors.description ? 'border-danger' : 'border-border'
          )}
        />
      </div>

      <div className="flex flex-col gap-2 border border-border bg-surface p-4">
        <p className="text-xs font-semibold text-ink-soft">
          Buscar cartas do catálogo
        </p>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            const value = new FormData(event.currentTarget).get('search')
            const term = typeof value === 'string' ? value.trim() : ''
            if (term) search.setFilters({ search: term })
          }}
        >
          <input
            type="search"
            name="search"
            defaultValue={search.filters.search ?? ''}
            placeholder="Nome ou efeito (ex: Agumon, explosão)…"
            aria-label="Buscar cartas do catálogo"
            className="h-9 min-w-0 flex-1 border border-border bg-surface-2 px-3 text-sm text-ink outline-none focus:border-primary placeholder:text-ink-faint"
          />
          <Button type="submit" variant="dark" size="sm">
            Buscar
          </Button>
        </form>

        {search.isLoading ? (
          <p className="text-[13px] text-ink-faint">Buscando…</p>
        ) : search.isError ? (
          <p className="text-[13px] text-danger">Não foi possível buscar cartas.</p>
        ) : search.cards.length > 0 ? (
          <ul className="flex max-h-64 flex-col gap-1.5 overflow-y-auto" aria-label="Resultados da busca">
            {search.cards.map((card) => {
              const tile = toCardTileData(card)
              const inDeck = cardList.some((entry) => entry.cardId === card.id)
              return (
                <li
                  key={card.id}
                  className="flex items-center justify-between gap-2 border border-border bg-surface-2 px-3 py-2 text-[13px] text-ink"
                >
                  <span className="min-w-0 truncate">
                    <span className="font-semibold">{card.name}</span>
                    <span className="ml-2 text-ink-faint">{card.number}</span>
                    <span className="ml-2 hidden text-ink-faint sm:inline">
                      {tile.type} · {card.dp != null ? `${card.dp} DP` : ''}
                    </span>
                  </span>
                  <Button
                    type="button"
                    variant={inDeck ? 'dark' : 'primary'}
                    size="sm"
                    disabled={inDeck}
                    onClick={() => addCard(card.id)}
                  >
                    {inDeck ? 'No deck' : 'Adicionar'}
                  </Button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-[13px] text-ink-faint">
            Nenhuma carta encontrada. Tente outro termo ou limpe a busca.
          </p>
        )}

        <div className="mt-1 flex items-center justify-between gap-2 border-t border-border pt-3">
          <p className="text-xs font-semibold text-ink-soft">
            Cartas do deck ({cardList.reduce((sum, entry) => sum + entry.quantity, 0)} no total)
          </p>
          {cardList.length > 0 ? (
            <button
              type="button"
              onClick={() => search.setFilters({})}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Limpar busca
            </button>
          ) : null}
        </div>

        {cardList.length === 0 ? (
          <p className="text-[13px] text-ink-faint">
            Nenhuma carta adicionada ainda. Busque e adicione cartas do catálogo.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {cardList.map((entry) => (
              <li
                key={entry.cardId}
                className="flex items-center justify-between gap-2 text-[13px] text-ink"
              >
                <span className="min-w-0 truncate">
                  <Tag>{entry.cardId}</Tag> <span className="ml-1">×{entry.quantity}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeCard(entry.cardId)}
                  className="shrink-0 text-xs font-semibold text-danger hover:underline"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
        {errors.cardList ? (
          <p className="text-xs font-semibold text-danger">{errors.cardList}</p>
        ) : null}
      </div>

      {errorMessage ? (
        <p role="alert" className="text-xs font-semibold text-danger">
          {errorMessage}
        </p>
      ) : null}

      {result ? (
        <div className="border border-border bg-surface-2 px-4 py-3">
          <p className="text-sm font-semibold text-ink">
            Deck salvo com sucesso!{' '}
            <Link href={`/decks/${result.slug}`} className="text-primary underline">
              Ver deck
            </Link>
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" size="md" disabled={isPending}>
          {isPending ? 'Salvando…' : submitLabel}
        </Button>
        <Button
          type="button"
          variant="dark"
          size="md"
          disabled={isPending}
          onClick={() => submit('published')}
        >
          {isPending ? 'Publicando…' : 'Salvar e publicar'}
        </Button>
      </div>
    </form>
  )
}
