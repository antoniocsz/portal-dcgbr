// Path: apps/web/src/features/decks/views/deck-form-view.tsx
// View do formulário de deck (criar E editar): metadados + composição (main/egg)
// com steppers de quantidade, legalidade ao vivo, capa, import de decklist e
// publicação na comunidade. Layout em duas colunas (busca à esquerda, painel do
// deck à direita); a View só renderiza e dispara callbacks dos VMs.
'use client'

import type { ChangeEvent, ReactNode } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Search } from 'lucide-react'
import { Button, CardHoverCard, CardTile, Sparkles, StatusBadge, X } from '@/components'
import { cn } from '@/lib/utils'
import { attributeColor, cardTypeLabel, toCardTileData } from '@/features/cards/viewmodels/card-view'
import { CARD_COLOR_LABELS, CARD_TYPE_LABELS } from '@/features/cards/model/types'
import type { CardColor, CardSummary, CardType } from '@/features/cards/model/types'
import { useCardSearch } from '@/features/cards/viewmodels/use-card-search'
import { useDeckForm, type DeckFormMode, type DeckZone } from '../viewmodels/use-deck-form'
import { useDeckPublications } from '../viewmodels/use-deck-publications'
import type { DeckStatus } from '../model/types'
import { DeckImportModal } from './deck-import-modal'
import { DeckPublishModal } from './deck-publish-modal'

const FORMAT_SUGGESTIONS = ['Standard', 'Booster Draft', 'Sealed', 'Casual']
const TYPE_VALUES: CardType[] = ['digimon', 'tamer', 'option', 'digiegg']
const COLOR_VALUES: CardColor[] = ['red', 'blue', 'yellow', 'green', 'purple', 'black', 'white']

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

function CardThumb({
  imageUrl,
  name,
  className
}: {
  imageUrl?: string | null
  name: string
  className?: string
}) {
  if (!imageUrl) {
    return (
      <span
        className={cn('flex items-center justify-center bg-surface-2 text-ink-faint', className)}
        aria-hidden="true"
      >
        <Sparkles className="size-4" />
      </span>
    )
  }
  return (
    <img
      src={imageUrl}
      alt={`Arte da carta ${name}`}
      loading="lazy"
      className={cn('object-contain', className)}
    />
  )
}

function QuantityStepper({
  value,
  max,
  label,
  onIncrement,
  onDecrement
}: {
  value: number
  max: number
  label: string
  onIncrement: () => void
  onDecrement: () => void
}) {
  return (
    <div
      role="group"
      aria-label={`Quantidade de ${label}`}
      className="inline-flex shrink-0 items-center border border-border bg-surface"
    >
      <button
        type="button"
        onClick={onDecrement}
        aria-label={`Diminuir quantidade de ${label}`}
        className="flex h-9 w-9 items-center justify-center text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        className="flex h-9 w-9 items-center justify-center border-x border-border text-[13px] font-semibold text-ink"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={value >= max}
        aria-label={`Aumentar quantidade de ${label}`}
        className="flex h-9 w-9 items-center justify-center text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-40"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

interface DeckEntryView {
  cardId: string
  quantity: number
  name: string
  number: string | null
  imageUrl: string | null
  max: number
}

function DeckZonePanel({
  title,
  hint,
  total,
  limit,
  entries,
  onIncrement,
  onDecrement,
  onRemove
}: {
  title: string
  hint: string
  total: number
  limit: number
  entries: DeckEntryView[]
  onIncrement: (cardId: string) => void
  onDecrement: (cardId: string) => void
  onRemove: (cardId: string) => void
}) {
  const full = total >= limit
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-ink-soft">{title}</p>
        <p className={cn('font-display text-sm font-bold', full ? 'text-warning' : 'text-ink')}>
          {total}
          <span className="text-ink-faint">/{limit}</span>
        </p>
      </div>
      {entries.length === 0 ? (
        <p className="border border-dashed border-border px-3 py-4 text-center text-[13px] text-ink-faint">
          {hint}
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {entries.map((entry) => (
            <li
              key={entry.cardId}
              className="flex items-center gap-2 border border-border bg-surface-2 p-1.5"
            >
              <CardThumb
                imageUrl={entry.imageUrl}
                name={entry.name}
                className="h-12 w-9 shrink-0 border border-border"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-ink">{entry.name}</p>
                {entry.number ? (
                  <p className="truncate text-[11px] text-ink-faint">{entry.number}</p>
                ) : null}
              </div>
              <QuantityStepper
                value={entry.quantity}
                max={entry.max}
                label={entry.name}
                onIncrement={() => onIncrement(entry.cardId)}
                onDecrement={() => onDecrement(entry.cardId)}
              />
              <button
                type="button"
                onClick={() => onRemove(entry.cardId)}
                aria-label={`Remover ${entry.name} do deck`}
                className="flex h-8 w-8 shrink-0 items-center justify-center text-ink-faint transition-colors hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export interface DeckFormViewProps {
  mode?: DeckFormMode
  slug?: string
  submitLabel?: string
  onSuccess?: (slug: string) => void
}

export function DeckFormView({ mode = 'create', slug, submitLabel, onSuccess }: DeckFormViewProps) {
  const router = useRouter()
  const isEdit = mode === 'edit'
  const vm = useDeckForm({ mode, slug })
  const search = useCardSearch()
  const publications = useDeckPublications()
  const [importOpen, setImportOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [term, setTerm] = useState(search.filters.search ?? '')
  const errorMessage = vm.error instanceof Error ? vm.error.message : null
  const saveLabel = submitLabel ?? (isEdit ? 'Salvar alterações' : 'Salvar deck')

  const submit = (status?: DeckStatus) => {
    void vm.handleSubmit(status).then((saved) => {
      if (!saved) return
      if (onSuccess) onSuccess(saved.slug)
      else if (isEdit) router.push(`/decks/${saved.slug}`)
    })
  }

  const applySearch = () => {
    const next = { ...search.filters }
    const trimmed = term.trim()
    if (trimmed) next.search = trimmed
    else delete next.search
    search.setFilters(next)
  }

  const applyTypeFilter = (value: string) => {
    const next = { ...search.filters }
    if (value) next.type = value as CardType
    else delete next.type
    search.setFilters(next)
  }

  const applyColorFilter = (value: string) => {
    const next = { ...search.filters }
    if (value) next.color = value as CardColor
    else delete next.color
    search.setFilters(next)
  }

  const clearFilters = () => {
    setTerm('')
    search.reset()
  }

  const hasActiveFilters =
    Boolean(search.filters.search) ||
    Boolean(search.filters.type) ||
    Boolean(search.filters.color) ||
    Boolean(search.filters.setCode) ||
    search.filters.playCost !== undefined

  const publishError =
    publications.publishError instanceof Error ? publications.publishError.message : null

  const coverCard: CardSummary | undefined = vm.coverCardId
    ? vm.resolveCard(vm.coverCardId)
    : undefined

  const toEntries = (
    list: { cardId: string; quantity: number }[],
    zone: DeckZone
  ): DeckEntryView[] => {
    const remaining = zone === 'egg' ? vm.remainingEgg : vm.remainingMain
    return list.map((entry) => {
      const card = vm.resolveCard(entry.cardId)
      return {
        cardId: entry.cardId,
        quantity: entry.quantity,
        name: card?.name ?? entry.cardId,
        number: card?.number ?? null,
        imageUrl: card?.imageUrl ?? null,
        max: Math.min(vm.maxCountFor(entry.cardId), entry.quantity + remaining)
      }
    })
  }

  const mainEntries = toEntries(vm.cardList, 'main')
  const eggEntries = toEntries(vm.eggList, 'egg')
  // Slug salvo: resultado do create/save ou o slug do deck em edição (já salvo).
  const savedSlug = vm.result?.slug ?? (isEdit ? vm.effectiveSlug : undefined)

  if (vm.isLoading) {
    return (
      <div className="flex w-full flex-col gap-4" aria-busy="true" aria-label="Carregando deck">
        <div className="h-24 animate-pulse bg-surface-2" />
        <div className="h-64 animate-pulse bg-surface-2" />
      </div>
    )
  }

  if (vm.isNotFound) {
    return (
      <div className="flex flex-col items-center gap-4 border border-border bg-surface px-4 py-16 text-center">
        <h2 className="font-display text-xl font-bold text-ink">Deck não encontrado</h2>
        <p className="text-sm text-ink-soft">
          Este deck não existe ou você não tem permissão para editá-lo.
        </p>
        <Link href="/decks" className="text-sm font-semibold text-primary hover:underline">
          ← Voltar para decks
        </Link>
      </div>
    )
  }

  if (vm.loadError) {
    return (
      <div className="flex flex-col items-center gap-4 border border-border bg-surface px-4 py-16 text-center">
        <p role="alert" className="text-sm text-ink-soft">
          {vm.loadError instanceof Error
            ? vm.loadError.message
            : 'Não foi possível carregar o deck.'}
        </p>
        <Button variant="dark" size="sm" onClick={() => void vm.refetchDeck()}>
          Tentar novamente
        </Button>
        <Link href="/decks" className="text-sm font-semibold text-primary hover:underline">
          ← Voltar para decks
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex w-full flex-col gap-5">
        <div className="grid gap-4 border border-border bg-surface p-4 sm:grid-cols-2">
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

          <div className="flex flex-col gap-1.5 sm:col-span-2">
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
              rows={2}
              placeholder="Estratégia, engine, combos…"
              className={cn(
                'w-full border bg-surface-2 px-3 py-2.5 text-sm text-ink outline-none transition-colors',
                'placeholder:text-ink-faint focus:border-primary'
              )}
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <p className="text-xs font-semibold text-ink-soft">
              URL: <span className="font-mono text-ink">/decks/{vm.effectiveSlug || '…'}</span>
            </p>
            {isEdit ? (
              <p className="text-[13px] text-ink-faint">
                O endereço (slug) do deck não muda ao editar.
              </p>
            ) : (
              <details className="text-[13px] text-ink-faint">
                <summary className="cursor-pointer select-none hover:text-ink-soft">
                  Avançado: definir slug manualmente
                </summary>
                <div className="pt-2">
                  <label htmlFor="deck-slug" className="sr-only">
                    Slug do deck
                  </label>
                  <input
                    id="deck-slug"
                    name="slug"
                    type="text"
                    value={vm.values.slug}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      vm.handleChange('slug', event.target.value)
                    }
                    placeholder="gerado do nome se vazio"
                    aria-invalid={vm.errors.slug ? true : undefined}
                    className={cn(
                      'h-9 w-full border bg-surface-2 px-3 font-mono text-[13px] text-ink outline-none transition-colors',
                      'placeholder:text-ink-faint focus:border-primary',
                      vm.errors.slug ? 'border-danger' : 'border-border'
                    )}
                  />
                  {vm.errors.slug ? (
                    <p className="pt-1 text-xs font-semibold text-danger">{vm.errors.slug}</p>
                  ) : null}
                </div>
              </details>
            )}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
          {/* Esquerda — busca/seleção de cartas */}
          <div className="flex flex-col gap-5">
            <section className="flex flex-col gap-3 border border-border bg-surface p-4">
              <h2 className="font-display text-sm font-bold text-ink">Buscar cartas do catálogo</h2>

              <div className="flex flex-wrap gap-2">
                <label className="sr-only" htmlFor="deck-search-type">
                  Filtrar por tipo
                </label>
                <select
                  id="deck-search-type"
                  value={search.filters.type ?? ''}
                  onChange={(event) => applyTypeFilter(event.target.value)}
                  className="h-9 border border-border bg-surface-2 px-2 text-[13px] text-ink outline-none focus:border-primary"
                >
                  <option value="">Todos os tipos</option>
                  {TYPE_VALUES.map((type) => (
                    <option key={type} value={type}>
                      {CARD_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
                <label className="sr-only" htmlFor="deck-search-color">
                  Filtrar por cor
                </label>
                <select
                  id="deck-search-color"
                  value={search.filters.color ?? ''}
                  onChange={(event) => applyColorFilter(event.target.value)}
                  className="h-9 border border-border bg-surface-2 px-2 text-[13px] text-ink outline-none focus:border-primary"
                >
                  <option value="">Todas as cores</option>
                  {COLOR_VALUES.map((color) => (
                    <option key={color} value={color}>
                      {CARD_COLOR_LABELS[color]}
                    </option>
                  ))}
                </select>
                {hasActiveFilters ? (
                  <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                ) : null}
              </div>

              <div className="flex gap-2">
                <input
                  id="deck-search-term"
                  type="search"
                  value={term}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setTerm(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      applySearch()
                    }
                  }}
                  placeholder="Nome ou efeito (ex: Agumon, explosão)…"
                  aria-label="Buscar cartas do catálogo"
                  className="h-9 min-w-0 flex-1 border border-border bg-surface-2 px-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary"
                />
                <Button variant="dark" size="sm" onClick={applySearch}>
                  <Search className="size-4" aria-hidden="true" />
                  Buscar
                </Button>
              </div>

              <div aria-live="polite">
                {search.isLoading ? (
                  <p className="text-[13px] text-ink-faint">Buscando cartas…</p>
                ) : search.isError ? (
                  <p className="text-[13px] text-danger">
                    Não foi possível buscar cartas. Tente novamente.
                  </p>
                ) : search.cards.length > 0 ? (
                  <>
                    <p className="pb-2 text-[11px] text-ink-faint">
                      Mostrando {search.cards.length} de {search.total} · até 4 cópias por carta
                    </p>
                    <ul
                      className="flex max-h-[28rem] flex-col gap-1.5 overflow-y-auto pr-1 lg:max-h-[40rem]"
                      aria-label="Resultados da busca"
                    >
                      {search.cards.map((card) => {
                        const zone: DeckZone = card.type === 'digiegg' ? 'egg' : 'main'
                        const list = zone === 'egg' ? vm.eggList : vm.cardList
                        const entry = list.find((item) => item.cardId === card.id)
                        const inDeck = Boolean(entry)
                        const remaining = zone === 'egg' ? vm.remainingEgg : vm.remainingMain
                        const cap = Math.min(
                          vm.maxCountFor(card.id),
                          (entry?.quantity ?? 0) + remaining
                        )
                        return (
                          <li key={card.id} className="border border-border bg-surface-2">
                            <CardHoverCard
                              card={{
                                name: card.name,
                                number: card.number,
                                color: attributeColor(card),
                                imageUrl: card.imageUrl
                              }}
                            >
                              <div className="flex items-center gap-3 p-2">
                                <CardThumb
                                  imageUrl={card.imageUrl}
                                  name={card.name}
                                  className="h-14 w-10 shrink-0 border border-border"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[13px] font-semibold text-ink">
                                    {card.name}
                                  </p>
                                  <p className="truncate text-[11px] text-ink-faint">
                                    {card.number} · {cardTypeLabel(card.type)}
                                    {card.dp != null ? ` · ${card.dp} DP` : ''}
                                  </p>
                                </div>
                                {inDeck ? (
                                  <QuantityStepper
                                    value={entry?.quantity ?? 0}
                                    max={cap}
                                    label={card.name}
                                    onIncrement={() => vm.incrementCard(zone, card.id)}
                                    onDecrement={() => vm.decrementCard(zone, card.id)}
                                  />
                                ) : (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    disabled={remaining <= 0}
                                    onClick={() =>
                                      zone === 'egg' ? vm.addEggCard(card) : vm.addCard(card)
                                    }
                                  >
                                    {zone === 'egg' ? 'Adicionar egg' : 'Adicionar'}
                                  </Button>
                                )}
                              </div>
                            </CardHoverCard>
                          </li>
                        )
                      })}
                    </ul>
                    {search.hasMore ? (
                      <div className="pt-3">
                        <Button
                          type="button"
                          variant="dark"
                          size="sm"
                          disabled={search.isFetchingMore}
                          onClick={search.loadMore}
                        >
                          {search.isFetchingMore ? 'Carregando…' : 'Carregar mais'}
                        </Button>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="text-[13px] text-ink-faint">
                    Nenhuma carta encontrada. Ajuste os filtros ou tente outro termo.
                  </p>
                )}
              </div>
            </section>

            <div className="flex items-center justify-between gap-3 border border-border bg-surface p-4">
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-ink-soft">Decklist pronta?</p>
                <p className="text-[13px] text-ink-faint">Cole o texto e preencha main + egg.</p>
              </div>
              <Button type="button" variant="dark" size="sm" onClick={() => setImportOpen(true)}>
                Importar decklist
              </Button>
            </div>
          </div>

          {/* Direita — painel do deck */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-6">
            <section className="flex flex-col gap-4 border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-sm font-bold text-ink">Seu deck</h2>
                {vm.isCheckingLegality ? (
                  <span className="text-xs text-ink-faint">Verificando…</span>
                ) : vm.legality ? (
                  <StatusBadge tone={vm.legality.legal ? 'success' : 'danger'}>
                    {vm.legality.legal ? 'Legal' : 'Ilegal'}
                  </StatusBadge>
                ) : (
                  <span className="text-xs text-ink-faint">Sem cartas</span>
                )}
              </div>

              <DeckZonePanel
                title="Main deck"
                hint="Adicione cartas do main pela busca."
                total={vm.totalMain}
                limit={50}
                entries={mainEntries}
                onIncrement={(cardId) => vm.incrementCard('main', cardId)}
                onDecrement={(cardId) => vm.decrementCard('main', cardId)}
                onRemove={vm.removeCard}
              />

              <DeckZonePanel
                title="Egg deck"
                hint="Adicione Digi-Eggs (até 5)."
                total={vm.totalEgg}
                limit={5}
                entries={eggEntries}
                onIncrement={(cardId) => vm.incrementCard('egg', cardId)}
                onDecrement={(cardId) => vm.decrementCard('egg', cardId)}
                onRemove={vm.removeEggCard}
              />

              {vm.legality && vm.legality.violations.length > 0 ? (
                <ul className="flex flex-col gap-1 border-t border-border pt-3">
                  {vm.legality.violations.map((violation, index) => (
                    <li
                      key={`${violation.code}-${violation.cardId ?? index}`}
                      className="text-xs text-danger"
                    >
                      {violation.message}
                    </li>
                  ))}
                </ul>
              ) : null}

              {vm.importSummary ? (
                <p className="border-t border-border pt-3 text-xs text-ink-soft">
                  Importado: {vm.importSummary.main} main · {vm.importSummary.egg} egg. Ignoradas:{' '}
                  {vm.importSummary.skipped}. Cortadas: {vm.importSummary.trimmed}.
                </p>
              ) : null}
            </section>

            <section className="flex flex-col gap-3 border border-border bg-surface p-4">
              <label htmlFor="deck-cover" className="text-xs font-semibold text-ink-soft">
                Carta de capa (opcional)
              </label>
              <div className="flex items-start gap-3">
                {coverCard ? (
                  <CardTile card={toCardTileData(coverCard)} className="w-20 shrink-0" />
                ) : null}
                <select
                  id="deck-cover"
                  value={vm.coverCardId ?? ''}
                  onChange={(event) => vm.setCoverCard(event.target.value || null)}
                  className="h-10 min-w-0 flex-1 border border-border bg-surface-2 px-3 text-sm text-ink outline-none focus:border-primary"
                >
                  <option value="">Sem capa</option>
                  {vm.cardList.map((entry) => (
                    <option key={entry.cardId} value={entry.cardId}>
                      {vm.resolveCard(entry.cardId)?.name ?? entry.cardId}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {vm.errors.cardList ? (
              <p className="text-xs font-semibold text-danger">{vm.errors.cardList}</p>
            ) : null}

            {errorMessage ? (
              <p role="alert" className="text-xs font-semibold text-danger">
                {errorMessage}
              </p>
            ) : null}

            <div className="flex flex-col gap-2 border border-border bg-surface p-4">
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={vm.isPending}
                onClick={() => submit(isEdit ? undefined : 'draft')}
              >
                {vm.isPending ? 'Salvando…' : saveLabel}
              </Button>
              {!isEdit ? (
                <>
                  <Button
                    type="button"
                    variant="dark"
                    size="md"
                    disabled={vm.isPending}
                    onClick={() => submit('published')}
                  >
                    {vm.isPending ? 'Publicando…' : 'Salvar e publicar'}
                  </Button>
                  <p className="text-center text-[11px] text-ink-faint">
                    Salvar e publicar envia o deck à comunidade (precisa estar legal).
                  </p>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {savedSlug ? (
          <div className="flex flex-col gap-3 border border-border bg-surface-2 px-4 py-3">
            {vm.result ? (
              <p className="text-sm font-semibold text-ink">
                Deck salvo!{' '}
                <Link href={`/decks/${savedSlug}`} className="text-primary underline">
                  Ver deck
                </Link>
              </p>
            ) : null}
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
      </div>

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

      {savedSlug ? (
        <DeckPublishModal
          open={publishOpen}
          title="Publicar na comunidade"
          message="Seu deck vai para o feed público da comunidade, com curtidas e cópias. O deck precisa estar legal (50 main, até 5 egg)."
          confirmLabel="Publicar"
          isPending={publications.publishing}
          error={publishError}
          onConfirm={() => {
            publications.publish(savedSlug)
            setPublishOpen(false)
          }}
          onClose={() => setPublishOpen(false)}
        />
      ) : null}
    </>
  )
}
