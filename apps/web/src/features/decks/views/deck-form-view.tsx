// Path: apps/web/src/features/decks/views/deck-form-view.tsx
// View do formulário de criação de deck: dados + composição (main/egg) + capa,
// legalidade ao vivo, import de decklist e publicação na comunidade após salvar.
// Controlada pelos ViewModels; a View só renderiza e dispara callbacks.
'use client'

import type { ChangeEvent, ReactNode } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { Button, StatusBadge } from '@/components'
import { cn } from '@/lib/utils'
import { useDeckForm } from '../viewmodels/use-deck-form'
import { useDeckPublications } from '../viewmodels/use-deck-publications'
import { useCardList } from '@/features/cards/viewmodels/use-card-list'
import { toCardTileData } from '@/features/cards/viewmodels/card-view'
import type { DeckStatus } from '../model/types'
import { DeckImportModal } from './deck-import-modal'
import { DeckPublishModal } from './deck-publish-modal'

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
  const vm = useDeckForm()
  const search = useCardList()
  const publications = useDeckPublications()
  const [importOpen, setImportOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const errorMessage = vm.error instanceof Error ? vm.error.message : null
  const nameById = new Map(search.cards.map((card) => [card.id, card.name]))

  const submit = (status: DeckStatus) => {
    void vm.handleSubmit(status).then((created) => {
      if (created) onSuccess?.(created.slug)
    })
  }

  const publishError =
    publications.publishError instanceof Error ? publications.publishError.message : null

  return (
    <>
      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          submit('draft')
        }}
      >
        <DeckField
          id="deck-name"
          label="Nome do deck"
          value={vm.values.name}
          onChange={(value) => vm.handleChange('name', value)}
          placeholder="Ex: Agumon Rush"
          required
          error={vm.errors.name ?? null}
        />

        <DeckField
          id="deck-slug"
          label="Slug (opcional)"
          value={vm.values.slug}
          onChange={(value) => vm.handleChange('slug', value)}
          placeholder="slug-seo-friendly (gerado do nome se vazio)"
          error={vm.errors.slug ?? null}
        />

        <DeckField
          id="deck-format"
          label="Formato"
          value={vm.values.format}
          onChange={(value) => vm.handleChange('format', value)}
          placeholder="Ex: Standard"
          required
          error={vm.errors.format ?? null}
        >
          <input
            id="deck-format"
            name="format"
            type="text"
            list="deck-formats"
            value={vm.values.format}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              vm.handleChange('format', event.target.value)
            }
            required
            aria-invalid={vm.errors.format ? true : undefined}
            className={cn(
              'h-10 w-full border bg-surface-2 px-3 text-sm text-ink outline-none transition-colors',
              'placeholder:text-ink-faint focus:border-primary',
              vm.errors.format ? 'border-danger' : 'border-border'
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
            value={vm.values.description}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              vm.handleChange('description', event.target.value)
            }
            rows={3}
            placeholder="Estratégia, engine, combos…"
            className={cn(
              'w-full border bg-surface-2 px-3 py-2.5 text-sm text-ink outline-none transition-colors',
              'placeholder:text-ink-faint focus:border-primary'
            )}
          />
        </div>

        <div className="flex items-center justify-between gap-3 border border-border bg-surface p-4">
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-ink-soft">Decklist pronta?</p>
            <p className="text-[13px] text-ink-faint">Cole o texto e preencha main + egg.</p>
          </div>
          <Button type="button" variant="dark" size="sm" onClick={() => setImportOpen(true)}>
            Importar decklist
          </Button>
        </div>

        <div className="flex flex-col gap-2 border border-border bg-surface p-4" aria-live="polite">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-ink-soft">Legalidade</p>
            {vm.isCheckingLegality ? (
              <span className="text-xs text-ink-faint">Verificando…</span>
            ) : vm.legality ? (
              <StatusBadge tone={vm.legality.legal ? 'success' : 'danger'}>
                {vm.legality.legal ? 'Legal' : 'Ilegal'}
              </StatusBadge>
            ) : (
              <span className="text-xs text-ink-faint">Adicione cartas</span>
            )}
          </div>
          <p className="text-xs text-ink-faint">
            main {vm.totalMain}/50 · egg {vm.totalEgg}/5
          </p>
          {vm.legality && vm.legality.violations.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {vm.legality.violations.map((violation, index) => (
                <li key={`${violation.code}-${violation.cardId ?? index}`} className="text-xs text-danger">
                  {violation.message}
                </li>
              ))}
            </ul>
          ) : null}
          {vm.importSummary ? (
            <p className="text-xs text-ink-soft">
              Importado: {vm.importSummary.main} main · {vm.importSummary.egg} egg. Ignoradas:{' '}
              {vm.importSummary.skipped}. Cortadas: {vm.importSummary.trimmed}.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 border border-border bg-surface p-4">
          <p className="text-xs font-semibold text-ink-soft">Buscar cartas do catálogo</p>
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
                const inMain = vm.cardList.some((entry) => entry.cardId === card.id)
                const isEgg = card.type === 'digiegg'
                const inEgg = vm.eggList.some((entry) => entry.cardId === card.id)
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
                    <span className="flex shrink-0 gap-2">
                      {isEgg ? (
                        <Button
                          type="button"
                          variant={inEgg ? 'dark' : 'primary'}
                          size="sm"
                          disabled={inEgg}
                          onClick={() => vm.addEggCard(card.id)}
                        >
                          {inEgg ? 'No egg' : 'Egg'}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant={inMain ? 'dark' : 'primary'}
                          size="sm"
                          disabled={inMain}
                          onClick={() => vm.addCard(card.id)}
                        >
                          {inMain ? 'No deck' : 'Adicionar'}
                        </Button>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-[13px] text-ink-faint">
              Nenhuma carta encontrada. Tente outro termo ou limpe a busca.
            </p>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2 border border-border bg-surface p-4">
            <p className="text-xs font-semibold text-ink-soft">
              Main deck ({vm.totalMain} cartas)
            </p>
            {vm.cardList.length === 0 ? (
              <p className="text-[13px] text-ink-faint">Nenhuma carta no main.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {vm.cardList.map((entry) => (
                  <li
                    key={entry.cardId}
                    className="flex items-center justify-between gap-2 text-[13px] text-ink"
                  >
                    <span className="min-w-0 truncate">
                      {nameById.get(entry.cardId) ?? entry.cardId} ×{entry.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => vm.removeCard(entry.cardId)}
                      className="shrink-0 text-xs font-semibold text-danger hover:underline"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-2 border border-border bg-surface p-4">
            <p className="text-xs font-semibold text-ink-soft">
              Egg deck ({vm.totalEgg} cartas)
            </p>
            {vm.eggList.length === 0 ? (
              <p className="text-[13px] text-ink-faint">Nenhuma carta no egg.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {vm.eggList.map((entry) => (
                  <li
                    key={entry.cardId}
                    className="flex items-center justify-between gap-2 text-[13px] text-ink"
                  >
                    <span className="min-w-0 truncate">
                      {nameById.get(entry.cardId) ?? entry.cardId} ×{entry.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => vm.removeEggCard(entry.cardId)}
                      className="shrink-0 text-xs font-semibold text-danger hover:underline"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="deck-cover" className="text-xs font-semibold text-ink-soft lg:text-[13px]">
            Carta de capa (opcional)
          </label>
          <select
            id="deck-cover"
            value={vm.coverCardId ?? ''}
            onChange={(event) => vm.setCoverCard(event.target.value || null)}
            className="h-10 w-full border border-border bg-surface-2 px-3 text-sm text-ink outline-none focus:border-primary"
          >
            <option value="">Sem capa</option>
            {vm.cardList.map((entry) => (
              <option key={entry.cardId} value={entry.cardId}>
                {nameById.get(entry.cardId) ?? entry.cardId}
              </option>
            ))}
          </select>
        </div>

        {vm.errors.cardList ? (
          <p className="text-xs font-semibold text-danger">{vm.errors.cardList}</p>
        ) : null}

        {errorMessage ? (
          <p role="alert" className="text-xs font-semibold text-danger">
            {errorMessage}
          </p>
        ) : null}

        {vm.result ? (
          <div className="flex flex-col gap-3 border border-border bg-surface-2 px-4 py-3">
            <p className="text-sm font-semibold text-ink">
              Deck salvo!{' '}
              <Link href={`/decks/${vm.result.slug}`} className="text-primary underline">
                Ver deck
              </Link>
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="dark" size="sm" onClick={() => setPublishOpen(true)}>
                Publicar na comunidade
              </Button>
              {publishError ? (
                <span role="alert" className="text-xs font-semibold text-danger">
                  {publishError}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="primary" size="md" disabled={vm.isPending}>
            {vm.isPending ? 'Salvando…' : submitLabel}
          </Button>
          <Button
            type="button"
            variant="dark"
            size="md"
            disabled={vm.isPending}
            onClick={() => submit('published')}
          >
            {vm.isPending ? 'Publicando…' : 'Salvar e publicar'}
          </Button>
        </div>
      </form>

      <DeckImportModal
        open={importOpen}
        text={vm.importText}
        onChangeText={vm.setImportText}
        onSubmit={() => void vm.handleImport(vm.importText)}
        onClose={() => {
          setImportOpen(false)
          vm.resetImport()
        }}
        isPending={vm.isImporting}
        error={vm.importError instanceof Error ? vm.importError.message : null}
        summary={vm.importSummary}
      />

      {vm.result ? (
        <DeckPublishModal
          open={publishOpen}
          title="Publicar na comunidade"
          message="Seu deck vai para o feed público da comunidade, com curtidas e cópias. O deck precisa estar legal (50 main, até 5 egg)."
          confirmLabel="Publicar"
          isPending={publications.publishing}
          error={publishError}
          onConfirm={() => {
            publications.publish(vm.result?.slug ?? '')
            setPublishOpen(false)
          }}
          onClose={() => setPublishOpen(false)}
        />
      ) : null}
    </>
  )
}
