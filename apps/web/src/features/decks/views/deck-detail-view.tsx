// Path: apps/web/src/features/decks/views/deck-detail-view.tsx
// View do detalhe completo de um deck: cabeçalho (nome, status, formato,
// contagens, descrição, dono e capa), legalidade, decklist em seções (nome +
// miniatura + quantidade + hovercard) e ações por papel (dono/l visitante).
// Só JSX — dados e callbacks vêm do ViewModel useDeck(slug).
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Avatar,
  Button,
  CardHoverCard,
  CardTile,
  StatusBadge,
  Tag,
  buttonVariants
} from '@/components'
import type { CardHoverCardData, StatusTone } from '@/components'
import { formatRelativeDate, statusLabel } from '../viewmodels/deck-view'
import type { DeckImageCardVisual } from '../viewmodels/use-deck-image-export'
import { useDeck } from '../viewmodels/use-deck'
import { DeckExportModal } from './deck-export-modal'
import { DeckImageExportButton } from './deck-image-export-button'
import { DeckPublishModal } from './deck-publish-modal'

export interface DeckDetailViewProps {
  slug: string
}

function statusTone(status: string): StatusTone {
  return status === 'published' ? 'success' : 'warning'
}

function sanitizeFileName(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${slug || 'deck'}-decklist.txt`
}

function CardThumb({
  imageUrl,
  number,
  name
}: {
  imageUrl: string | null
  number: string
  name: string
}) {
  const [failed, setFailed] = useState(false)

  if (imageUrl && !failed) {
    return (
      <span className="relative h-14 w-10 shrink-0 border border-border bg-surface-2">
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="40px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      </span>
    )
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-14 w-10 shrink-0 items-center justify-center border border-border bg-surface-2 text-[9px] font-bold text-ink-faint"
    >
      {number || name.slice(0, 2)}
    </span>
  )
}

function DeckListItem({
  cardId,
  name,
  number,
  quantity,
  hoverCard
}: {
  cardId: string
  name: string
  number: string | null
  quantity: number
  hoverCard: CardHoverCardData | null
}) {
  const content = (
    <span className="flex min-w-0 items-center gap-3">
      <CardThumb imageUrl={hoverCard?.imageUrl ?? null} number={number ?? ''} name={name} />
      <span className="min-w-0 truncate text-ink">
        {number ? <span className="text-ink-faint">{number} </span> : null}
        {name}
      </span>
    </span>
  )

  return (
    <li className="flex items-center justify-between gap-3 border border-border bg-surface p-2 text-sm">
      {hoverCard ? (
        <CardHoverCard card={hoverCard} className="min-w-0">
          <Link
            href={`/cartas/${cardId}`}
            className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {content}
          </Link>
        </CardHoverCard>
      ) : (
        content
      )}
      <span className="shrink-0 text-ink-soft">×{quantity}</span>
    </li>
  )
}

export function DeckDetailView({ slug }: DeckDetailViewProps) {
  const router = useRouter()
  const vm = useDeck(slug)
  const [exportOpen, setExportOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (vm.isLoading) {
    return (
      <div
        className="mx-auto flex w-full max-w-[1080px] flex-col gap-4 px-4 py-10 lg:px-12"
        aria-busy="true"
        aria-label="Carregando deck"
      >
        <div className="h-10 w-2/3 animate-pulse bg-surface-2" />
        <div className="h-4 w-1/2 animate-pulse bg-surface-2" />
        <div className="h-64 animate-pulse bg-surface-2" />
      </div>
    )
  }

  if (vm.isNotFound) {
    return (
      <div className="mx-auto flex w-full max-w-[1080px] flex-col items-center gap-4 px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">Deck não encontrado</h1>
        <p className="text-sm text-ink-soft">
          Este deck não existe ou não está disponível para você.
        </p>
        <Link href="/decks" className="text-sm font-semibold text-primary hover:underline">
          ← Voltar para decks
        </Link>
      </div>
    )
  }

  if (vm.isError || !vm.deck || !vm.group) {
    return (
      <div className="mx-auto flex w-full max-w-[1080px] flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-sm text-ink-soft">
          {vm.error instanceof Error ? vm.error.message : 'Não foi possível carregar o deck.'}
        </p>
        <Button variant="dark" size="sm" onClick={() => void vm.refetch()}>
          Tentar novamente
        </Button>
        <Link href="/decks" className="text-sm font-semibold text-primary hover:underline">
          ← Voltar para decks
        </Link>
      </div>
    )
  }

  const deck = vm.deck
  const group = vm.group
  const maxBucket = Math.max(1, ...(vm.curve?.buckets.map((bucket) => bucket.count) ?? [1]))
  const isPublishedToCommunity = vm.publicationStatus === 'public'
  const resolveImageCard = (cardId: string): DeckImageCardVisual | null => {
    const hover = vm.resolveHoverCard(cardId)
    return hover ? { imageUrl: hover.imageUrl ?? null, color: hover.color } : null
  }
  const actionError =
    vm.publishError instanceof Error
      ? vm.publishError.message
      : vm.removeError instanceof Error
        ? vm.removeError.message
        : null

  return (
    <article className="mx-auto w-full max-w-[1080px] px-4 py-10 lg:px-12">
      <header className="flex flex-col gap-4 border-b border-border pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">{deck.name}</h1>
              <StatusBadge tone={statusTone(deck.status)}>{statusLabel(deck.status)}</StatusBadge>
            </div>
            {vm.ownerName ? (
              <div className="flex items-center gap-2 text-sm text-ink-soft">
                <Avatar name={vm.ownerName} size="sm" />
                <span>{vm.ownerName}</span>
                <span aria-hidden="true" className="text-ink-faint">
                  ·
                </span>
                <span>atualizado {formatRelativeDate(deck.updatedAt)}</span>
              </div>
            ) : (
              <span className="text-sm text-ink-soft">
                atualizado {formatRelativeDate(deck.updatedAt)}
              </span>
            )}
          </div>

          {vm.coverCard ? (
            <CardTile card={vm.coverCard} className="hidden w-40 shrink-0 sm:block" />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Tag>{deck.format}</Tag>
          <Tag>main {group.mainCount}</Tag>
          <Tag>egg {group.eggCount}</Tag>
          <Tag>{group.total} cartas</Tag>
        </div>

        {deck.description ? (
          <p className="max-w-3xl text-base leading-6 text-ink-soft">{deck.description}</p>
        ) : null}
      </header>

      <div className="flex flex-wrap items-center gap-3 py-6">
        {vm.isOwner ? (
          <>
            <Link
              href={`/decks/${deck.slug}/editar`}
              className={buttonVariants({ variant: 'dark', size: 'sm' })}
            >
              Editar
            </Link>
            {deck.status === 'draft' ? (
              <Button
                variant="primary"
                size="sm"
                disabled={vm.isPublishing}
                onClick={vm.publish}
              >
                {vm.isPublishing ? 'Publicando…' : 'Publicar'}
              </Button>
            ) : null}
            {isPublishedToCommunity ? (
              <Button
                variant="dark"
                size="sm"
                disabled={vm.isUnpublishingFromCommunity}
                onClick={vm.unpublishFromCommunity}
              >
                {vm.isUnpublishingFromCommunity ? 'Removendo…' : 'Despublicar da comunidade'}
              </Button>
            ) : (
              <Button
                variant="dark"
                size="sm"
                disabled={vm.isPublishingToCommunity}
                onClick={vm.publishToCommunity}
              >
                {vm.isPublishingToCommunity ? 'Publicando…' : 'Publicar na comunidade'}
              </Button>
            )}
            <Button
              variant="dark"
              size="sm"
              onClick={() => {
                setExportOpen(true)
                void vm.exporter.exportDeckList(deck.slug)
              }}
            >
              Exportar
            </Button>
            <Button variant="dark" size="sm" onClick={() => setConfirmDelete(true)}>
              Excluir
            </Button>
          </>
        ) : (
          <Button variant="primary" size="sm" disabled={vm.isCopying} onClick={vm.copy}>
            {vm.isCopying ? 'Copiando…' : 'Copiar deck'}
          </Button>
        )}
      </div>

      {actionError ? (
        <p role="alert" className="pb-4 text-xs font-semibold text-danger">
          {actionError}
        </p>
      ) : null}
      {vm.communityError ? (
        <p role="alert" className="pb-4 text-xs font-semibold text-danger">
          {vm.communityError}
        </p>
      ) : null}
      {vm.copied ? (
        <p role="status" className="pb-4 text-xs font-semibold text-success">
          Deck copiado para os seus decks (rascunho).{' '}
          <Link href="/decks" className="underline">
            Ver meus decks
          </Link>
        </p>
      ) : vm.copyError instanceof Error ? (
        <p role="alert" className="pb-4 text-xs font-semibold text-danger">
          {vm.copyError.message}
        </p>
      ) : null}

      <section aria-label="Legalidade da composição" className="pb-8">
        <h2 className="pb-3 font-display text-xl font-bold text-ink">Legalidade</h2>
        {vm.isCheckingLegality ? (
          <div className="h-12 animate-pulse bg-surface-2" aria-busy="true" aria-label="Verificando legalidade" />
        ) : vm.legality ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={vm.legality.legal ? 'success' : 'danger'}>
                {vm.legality.legal ? 'Composição legal' : 'Composição ilegal'}
              </StatusBadge>
              <Tag>main {vm.legality.mainCount}</Tag>
              <Tag>egg {vm.legality.eggCount}</Tag>
            </div>
            {vm.legality.violations.length > 0 ? (
              <ul className="flex flex-col gap-1 border border-danger/40 bg-surface px-4 py-3 text-[13px] text-ink-soft">
                {vm.legality.violations.map((violation, index) => (
                  <li key={`${violation.code}-${violation.cardId ?? index}`}>
                    <span className="font-semibold text-danger">• </span>
                    {violation.message}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-ink-soft">Sem cartas para avaliar.</p>
        )}
      </section>

      {vm.curve && vm.curve.buckets.length > 0 ? (
        <section aria-label="Curva de custo" className="pb-8">
          <h2 className="pb-3 font-display text-xl font-bold text-ink">Curva de custo</h2>
          <div className="flex flex-col gap-1.5">
            {vm.curve.buckets.map((bucket) => (
              <div key={bucket.cost} className="flex items-center gap-3 text-[13px] text-ink-soft">
                <span className="w-14 shrink-0">Custo {bucket.cost}</span>
                <span
                  className="h-3 bg-primary/70"
                  style={{
                    width: `${(bucket.count / maxBucket) * 100}%`,
                    minWidth: bucket.count > 0 ? '0.5rem' : 0
                  }}
                  aria-hidden="true"
                />
                <span className="shrink-0">{bucket.count}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section aria-label="Decklist">
        <h2 className="pb-3 font-display text-xl font-bold text-ink">Decklist</h2>
        {group.sections.length === 0 ? (
          <p className="border border-border bg-surface px-4 py-8 text-center text-sm text-ink-soft">
            Este deck ainda não tem cartas.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {group.sections.map((section) => (
              <div key={section.key}>
                <h3 className="pb-2 text-sm font-semibold text-ink-soft">
                  {section.title} <span className="text-ink-faint">({section.total})</span>
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {section.items.map((item) => (
                    <DeckListItem
                      key={item.cardId}
                      cardId={item.cardId}
                      name={item.name}
                      number={item.number}
                      quantity={item.quantity}
                      hoverCard={vm.resolveHoverCard(item.cardId)}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="pt-8">
        <Link href="/decks" className="text-sm font-semibold text-primary hover:underline">
          ← Voltar para decks
        </Link>
      </div>

      <DeckExportModal
        open={exportOpen}
        text={vm.exporter.exportText ?? ''}
        fileName={sanitizeFileName(deck.name)}
        isLoading={vm.exporter.isExporting}
        error={vm.exporter.exportError instanceof Error ? vm.exporter.exportError.message : null}
        copied={vm.exporter.copied}
        onCopy={() => void vm.exporter.copyText(vm.exporter.exportText ?? '')}
        onDownload={() =>
          vm.exporter.downloadText(vm.exporter.exportText ?? '', sanitizeFileName(deck.name))
        }
        onClose={() => {
          vm.exporter.resetExport()
          setExportOpen(false)
        }}
        imageExport={
          <DeckImageExportButton
            deck={deck}
            group={group}
            coverImageUrl={vm.coverCard?.imageUrl ?? null}
            resolveCard={resolveImageCard}
          />
        }
      />

      <DeckPublishModal
        open={confirmDelete}
        title="Excluir deck"
        message="O deck será removido definitivamente. Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        isPending={vm.isRemoving}
        error={vm.removeError instanceof Error ? vm.removeError.message : null}
        onConfirm={() => vm.remove(() => router.push('/decks'))}
        onClose={() => setConfirmDelete(false)}
      />
    </article>
  )
}
