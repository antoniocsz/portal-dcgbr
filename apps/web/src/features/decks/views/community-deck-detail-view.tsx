// Path: apps/web/src/features/decks/views/community-deck-detail-view.tsx
// View do detalhe de um deck da comunidade: autor, cores, capa, legalidade,
// contagens main/egg, like, "copiar pra mim", exportar (dono) e a decklist em
// seções (via deck-sections). Dados e callbacks vêm dos ViewModels.
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Avatar, Button, ColorChip, StatusBadge, Tag } from '@/components'
import { ATTRIBUTE_LABELS } from '@/components'
import { useSession } from '@/lib/use-session'
import { formatRelativeDate } from '../viewmodels/deck-view'
import { useCommunityDeck } from '../viewmodels/use-community-deck'
import { useDeckImportExport } from '../viewmodels/use-deck-import-export'
import { useDeckPublications } from '../viewmodels/use-deck-publications'
import { DeckExportModal } from './deck-export-modal'
import { DeckPublishModal } from './deck-publish-modal'

type ManageAction = 'publish' | 'unpublish'

function sanitizeFileName(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${slug || 'deck'}-decklist.txt`
}

export interface CommunityDeckDetailViewProps {
  id: string
}

export function CommunityDeckDetailView({ id }: CommunityDeckDetailViewProps) {
  const { user } = useSession()
  const vm = useCommunityDeck(id)
  const publications = useDeckPublications()
  const exporter = useDeckImportExport()
  const [exportOpen, setExportOpen] = useState(false)
  const [manage, setManage] = useState<ManageAction | null>(null)

  const deck = vm.deck

  if (vm.isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-4 px-4 py-10 lg:px-12" aria-busy="true" aria-label="Carregando deck">
        <div className="h-10 w-2/3 animate-pulse bg-surface-2" />
        <div className="h-4 w-1/2 animate-pulse bg-surface-2" />
        <div className="h-64 animate-pulse bg-surface-2" />
      </div>
    )
  }

  if (vm.isError || !deck) {
    return (
      <div className="mx-auto flex w-full max-w-[1080px] flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-sm text-ink-soft">
          {vm.error instanceof Error ? vm.error.message : 'Não foi possível carregar o deck.'}
        </p>
        <Button variant="dark" size="sm" onClick={() => void vm.refetch()}>
          Tentar novamente
        </Button>
        <Link href="/decks/comunidade" className="text-sm font-semibold text-primary hover:underline">
          ← Voltar para a comunidade
        </Link>
      </div>
    )
  }

  const isOwner = user?.id === deck.ownerId
  const publication = publications.publications.find((item) => item.id === deck.id) ?? null
  const sourceSlug = publication?.slug ?? null
  const canExport = isOwner && sourceSlug !== null
  const manageError =
    publications.publishError instanceof Error
      ? publications.publishError.message
      : publications.unpublishError instanceof Error
        ? publications.unpublishError.message
        : null
  const maxBucket = Math.max(1, ...(vm.curve?.buckets.map((bucket) => bucket.count) ?? [1]))

  return (
    <article className="mx-auto w-full max-w-[1080px] px-4 py-10 lg:px-12">
      <header className="flex flex-col gap-4 border-b border-border pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">{deck.name}</h1>
              <StatusBadge tone={deck.legal ? 'success' : 'danger'}>
                {deck.legal ? 'Composição legal' : 'Composição ilegal'}
              </StatusBadge>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <Avatar name={deck.ownerName} size="sm" />
              <span>{deck.ownerName}</span>
              <span aria-hidden="true" className="text-ink-faint">
                ·
              </span>
              <span>atualizado {formatRelativeDate(deck.updatedAt)}</span>
            </div>
            {vm.colors.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {vm.colors.map((color) => (
                  <ColorChip key={color} color={color} label={ATTRIBUTE_LABELS[color]} />
                ))}
              </div>
            ) : null}
          </div>

          {vm.coverCard?.imageUrl ? (
            <img
              src={vm.coverCard.imageUrl}
              alt={`Arte de ${vm.coverCard.name}`}
              className="hidden h-40 w-28 shrink-0 border border-border object-cover sm:block"
            />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Tag>main {vm.group?.mainCount ?? 0}</Tag>
          <Tag>egg {vm.group?.eggCount ?? 0}</Tag>
          <Tag>{vm.group?.total ?? 0} cartas</Tag>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 py-6">
        {isOwner ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
            ♥ {deck.likeCount} curtidas
          </span>
        ) : (
          <Button variant={deck.likedByMe ? 'dark' : 'primary'} size="sm" disabled={vm.liking} onClick={vm.toggleLike}>
            {deck.likedByMe ? '♥ Curtido' : '♥ Curtir'} · {deck.likeCount}
          </Button>
        )}

        {!isOwner ? (
          <Button variant="dark" size="sm" disabled={vm.copying} onClick={vm.copy}>
            {vm.copying ? 'Copiando…' : 'Copiar pra mim'}
          </Button>
        ) : null}

        {canExport ? (
          <Button
            variant="dark"
            size="sm"
            onClick={() => {
              setExportOpen(true)
              void exporter.exportDeckList(sourceSlug ?? '')
            }}
          >
            Exportar
          </Button>
        ) : null}

        {isOwner && sourceSlug ? (
          <>
            <Button
              variant="dark"
              size="sm"
              disabled={publications.publishing}
              onClick={() => setManage('publish')}
            >
              {publication?.outdated ? 'Atualizar publicação' : 'Republicar'}
            </Button>
            <Button
              variant="dark"
              size="sm"
              disabled={publications.unpublishing}
              onClick={() => setManage('unpublish')}
            >
              Despublicar
            </Button>
          </>
        ) : null}
      </div>

      {vm.copyError ? (
        <p role="alert" className="pb-4 text-xs font-semibold text-danger">
          {vm.copyError instanceof Error ? vm.copyError.message : 'Não foi possível copiar o deck.'}
        </p>
      ) : vm.copied ? (
        <p role="status" className="pb-4 text-xs font-semibold text-success">
          Deck copiado para os seus decks (rascunho).{' '}
          <Link href="/decks" className="underline">
            Ver meus decks
          </Link>
        </p>
      ) : null}

      {manageError ? (
        <p role="alert" className="pb-4 text-xs font-semibold text-danger">
          {manageError}
        </p>
      ) : null}

      {publication?.outdated ? (
        <p className="pb-6 text-xs text-ink-soft">
          A publicação está desatualizada em relação ao seu deck de origem. Republicar atualiza a
          composição exibida.
        </p>
      ) : null}

      {vm.curve && vm.curve.buckets.length > 0 ? (
        <section aria-label="Curva de custo" className="pb-8">
          <h2 className="pb-3 font-display text-xl font-bold text-ink">Curva de custo</h2>
          <div className="flex flex-col gap-1.5">
            {vm.curve.buckets.map((bucket) => (
              <div key={bucket.cost} className="flex items-center gap-3 text-[13px] text-ink-soft">
                <span className="w-14 shrink-0">Custo {bucket.cost}</span>
                <span
                  className="h-3 bg-primary/70"
                  style={{ width: `${(bucket.count / maxBucket) * 100}%`, minWidth: bucket.count > 0 ? '0.5rem' : 0 }}
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
        {!vm.group || vm.group.sections.length === 0 ? (
          <p className="border border-border bg-surface px-4 py-8 text-center text-sm text-ink-soft">
            Este deck não tem cartas.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {vm.group.sections.map((section) => (
              <div key={section.key}>
                <h3 className="pb-2 text-sm font-semibold text-ink-soft">
                  {section.title} <span className="text-ink-faint">({section.total})</span>
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {section.items.map((item) => (
                    <li
                      key={item.cardId}
                      className="flex items-center justify-between border border-border bg-surface px-4 py-2.5 text-sm text-ink"
                    >
                      <span className="min-w-0 truncate">
                        {item.number ? <span className="text-ink-faint">{item.number} </span> : null}
                        {item.name}
                      </span>
                      <span className="shrink-0 text-ink-soft">×{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="pt-8">
        <Link href="/decks/comunidade" className="text-sm font-semibold text-primary hover:underline">
          ← Voltar para a comunidade
        </Link>
      </div>

      {canExport ? (
        <DeckExportModal
          open={exportOpen}
          text={exporter.exportText ?? ''}
          fileName={sanitizeFileName(deck.name)}
          isLoading={exporter.isExporting}
          error={exporter.exportError instanceof Error ? exporter.exportError.message : null}
          copied={exporter.copied}
          onCopy={() => void exporter.copyText(exporter.exportText ?? '')}
          onDownload={() => exporter.downloadText(exporter.exportText ?? '', sanitizeFileName(deck.name))}
          onClose={() => {
            exporter.resetExport()
            setExportOpen(false)
          }}
        />
      ) : null}

      <DeckPublishModal
        open={manage !== null}
        title={manage === 'unpublish' ? 'Despublicar da comunidade' : 'Atualizar publicação'}
        message={
          manage === 'unpublish'
            ? 'O deck sai do feed público. As curtidas e cópias são preservadas.'
            : 'A composição exibida na comunidade será atualizada com a versão atual do seu deck.'
        }
        confirmLabel={manage === 'unpublish' ? 'Despublicar' : 'Atualizar'}
        isPending={publications.publishing || publications.unpublishing}
        error={manageError}
        onConfirm={() => {
          if (manage === 'unpublish') publications.unpublish(sourceSlug ?? '')
          else publications.publish(sourceSlug ?? '')
          setManage(null)
        }}
        onClose={() => setManage(null)}
      />
    </article>
  )
}
