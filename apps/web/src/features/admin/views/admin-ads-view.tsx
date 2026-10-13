// Path: apps/web/src/features/admin/views/admin-ads-view.tsx
// View do painel admin de anúncios (design "Admin — Anúncios"): listagem de
// curadoria (título/tipo/placements/status/janela/impressões-cliques) com
// filtros e ações (ativar/desativar, editar, excluir com confirmação) +
// formulário inline de criação/edição. Só JSX — dados e callbacks vêm dos
// ViewModels (useAdminAds / useAdminAdForm). Curadoria é administrator-only
// (o layout admin e o backend revalidam).
'use client'

import type { ReactNode } from 'react'
import { Button, Card, StatusBadge } from '@/components'
import { cn } from '@/lib/utils'
import { AdminPageHeader } from './admin-page-header'
import { AdminTable } from './admin-table'
import type { AdminTableColumn } from './admin-table'
import {
  toAdFormValues,
  useAdminAds,
  useAdminAdForm,
  type AdminAdsStatusFilter,
  type AdFormValues
} from '../viewmodels/use-admin-ads'
import { AD_KINDS, AD_PLACEMENTS } from '../model/ads-admin-api'
import type { Ad, AdKind, AdPlacement } from '@/features/ads/model/types'

const KIND_LABELS: Record<AdKind, string> = {
  house: 'House',
  affiliate: 'Afiliado',
  sponsor: 'Patrocínio'
}

const PLACEMENT_LABELS: Record<AdPlacement, string> = {
  'home-top': 'Home — topo',
  'home-infeed': 'Home — in-feed',
  'cards-top': 'Cartas — topo',
  'article-inline': 'Artigo — inline'
}

/** Dica contextual do link de destino por tipo (afiliado/house/patrocínio). */
const TARGET_HINTS: Record<AdKind, string> = {
  house: 'Link do e-commerce próprio do projeto (divulgação interna).',
  affiliate:
    'Cole o link de afiliado (ex.: Amazon Associates). O link será servido como '
    + '"rel=sponsored nofollow noopener".',
  sponsor:
    'Link do patrocinador (loja/organizador de torneios). O link será servido como '
    + '"rel=sponsored nofollow noopener".'
}

const STATUS_FILTERS: { value: AdminAdsStatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' }
]

const KIND_FILTERS: { value: AdKind | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos os tipos' },
  ...AD_KINDS.map((kind) => ({ value: kind, label: KIND_LABELS[kind] }))
]

const PLACEMENT_FILTERS: { value: AdPlacement | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas as posições' },
  ...AD_PLACEMENTS.map((placement) => ({ value: placement, label: PLACEMENT_LABELS[placement] }))
]

const INPUT_CLASS =
  'h-10 w-full border border-border bg-surface-2 px-3 text-sm text-ink outline-none '
  + 'focus:border-primary placeholder:text-ink-faint'

function formatDate(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })
}

function formatWindow(startAt: string | null, endAt: string | null): string {
  if (!startAt && !endAt) return 'Sempre ativo'
  const start = startAt ? formatDate(startAt) : 'início'
  const end = endAt ? formatDate(endAt) : 'sem fim'
  return `${start} → ${end}`
}

interface FieldProps {
  label: string
  htmlFor: string
  error?: string | undefined
  hint?: string | undefined
  children: ReactNode
}

function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-bold uppercase tracking-wide text-ink-faint"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-[12px] text-ink-faint">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-[12px] font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

interface AdFormPanelProps {
  adId?: string | undefined
  initial?: AdFormValues | undefined
  onClose: () => void
}

function AdFormPanel({ adId, initial, onClose }: AdFormPanelProps) {
  const form = useAdminAdForm({ ...(adId ? { adId } : {}), ...(initial ? { initial } : {}) })
  const isEdit = Boolean(adId)

  const submit = async () => {
    try {
      const ok = await form.handleSubmit()
      if (ok) onClose()
    } catch {
      // erro exposto em form.error
    }
  }

  return (
    <Card className="p-5 lg:p-6">
      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-lg font-bold text-ink">
            {isEdit ? 'Editar anúncio' : 'Novo anúncio'}
          </h2>
          <p className="text-[13px] text-ink-soft">
            {isEdit
              ? 'Altere os campos e salve as mudanças.'
              : 'Preencha os campos e crie o anúncio.'}
          </p>
        </div>

        {form.error ? (
          <p role="alert" className="text-xs font-semibold text-danger">
            {form.error instanceof Error ? form.error.message : 'Falha ao salvar o anúncio.'}
          </p>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Título" htmlFor="ad-title" error={form.errors.title}>
            <input
              id="ad-title"
              className={INPUT_CLASS}
              value={form.values.title}
              placeholder="Assinatura de janeiro"
              onChange={(event) => form.setField('title', event.target.value)}
            />
          </Field>

          <Field label="Tipo" htmlFor="ad-kind">
            <select
              id="ad-kind"
              className={INPUT_CLASS}
              value={form.values.kind}
              onChange={(event) => form.setField('kind', event.target.value as AdKind)}
            >
              {AD_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {KIND_LABELS[kind]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Subtítulo" htmlFor="ad-subtitle">
            <input
              id="ad-subtitle"
              className={INPUT_CLASS}
              value={form.values.subtitle}
              onChange={(event) => form.setField('subtitle', event.target.value)}
            />
          </Field>

          <Field label="Imagem (URL)" htmlFor="ad-image" error={form.errors.imageUrl}>
            <input
              id="ad-image"
              type="url"
              className={INPUT_CLASS}
              value={form.values.imageUrl}
              placeholder="https://…/criativo.jpg"
              onChange={(event) => form.setField('imageUrl', event.target.value)}
            />
          </Field>

          <div className="lg:col-span-2">
            <Field
              label="Link de destino"
              htmlFor="ad-target"
              error={form.errors.targetUrl}
              hint={TARGET_HINTS[form.values.kind]}
            >
              <input
                id="ad-target"
                type="url"
                className={INPUT_CLASS}
                value={form.values.targetUrl}
                placeholder="https://…"
                onChange={(event) => form.setField('targetUrl', event.target.value)}
              />
            </Field>
          </div>

          <Field label="CTA" htmlFor="ad-cta">
            <input
              id="ad-cta"
              className={INPUT_CLASS}
              value={form.values.ctaLabel}
              placeholder="Saiba mais"
              onChange={(event) => form.setField('ctaLabel', event.target.value)}
            />
          </Field>

          <Field label="Nome do patrocinador" htmlFor="ad-sponsor">
            <input
              id="ad-sponsor"
              className={INPUT_CLASS}
              value={form.values.sponsorName}
              onChange={(event) => form.setField('sponsorName', event.target.value)}
            />
          </Field>

          <Field label="Rótulo de divulgação" htmlFor="ad-disclosure">
            <input
              id="ad-disclosure"
              className={INPUT_CLASS}
              value={form.values.disclosure}
              placeholder="Publicidade / Parceiro"
              onChange={(event) => form.setField('disclosure', event.target.value)}
            />
          </Field>

          <Field label="Prioridade (peso de rotação)" htmlFor="ad-priority" error={form.errors.priority}>
            <input
              id="ad-priority"
              type="number"
              min={0}
              inputMode="numeric"
              className={INPUT_CLASS}
              value={form.values.priority}
              onChange={(event) => form.setField('priority', event.target.value)}
            />
          </Field>

          <Field label="Início da janela" htmlFor="ad-start">
            <input
              id="ad-start"
              type="datetime-local"
              className={INPUT_CLASS}
              value={form.values.startAt}
              onChange={(event) => form.setField('startAt', event.target.value)}
            />
          </Field>

          <Field label="Fim da janela" htmlFor="ad-end" error={form.errors.endAt}>
            <input
              id="ad-end"
              type="datetime-local"
              className={INPUT_CLASS}
              value={form.values.endAt}
              onChange={(event) => form.setField('endAt', event.target.value)}
            />
          </Field>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">
            Placements
          </legend>
          <div className="flex flex-wrap gap-2">
            {AD_PLACEMENTS.map((placement) => {
              const id = `ad-placement-${placement}`
              const checked = form.values.placements.includes(placement)
              return (
                <label
                  key={placement}
                  htmlFor={id}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-2 border px-3 py-2 text-[13px]',
                    checked
                      ? 'border-primary bg-primary-soft text-ink'
                      : 'border-border bg-surface-2 text-ink-soft'
                  )}
                >
                  <input
                    id={id}
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={checked}
                    onChange={() => form.togglePlacement(placement)}
                  />
                  {PLACEMENT_LABELS[placement]}
                </label>
              )
            })}
          </div>
          {form.errors.placements ? (
            <p role="alert" className="text-[12px] font-semibold text-danger">
              {form.errors.placements}
            </p>
          ) : null}
        </fieldset>

        <div className="flex flex-wrap items-center gap-5">
          <label htmlFor="ad-active" className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              id="ad-active"
              type="checkbox"
              className="size-4 accent-primary"
              checked={form.values.isActive}
              onChange={(event) => form.setField('isActive', event.target.checked)}
            />
            Ativo
          </label>
          <label htmlFor="ad-newtab" className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              id="ad-newtab"
              type="checkbox"
              className="size-4 accent-primary"
              checked={form.values.openInNewTab}
              onChange={(event) => form.setField('openInNewTab', event.target.checked)}
            />
            Abrir em nova aba
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" size="sm" disabled={form.isPending}>
            {form.isPending ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar anúncio'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={form.isPending}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}

export function AdminAdsView() {
  const vm = useAdminAds()
  const actionError = vm.removeError ?? vm.toggleError

  const columns: AdminTableColumn<Ad>[] = [
    {
      key: 'title',
      header: 'Anúncio',
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-ink">{row.title}</span>
          {row.sponsorName ? (
            <span className="text-[11px] uppercase tracking-wide text-ink-faint">
              {row.sponsorName}
            </span>
          ) : null}
        </div>
      )
    },
    {
      key: 'kind',
      header: 'Tipo',
      render: (row) => <span className="text-ink-soft">{KIND_LABELS[row.kind]}</span>
    },
    {
      key: 'placements',
      header: 'Placements',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.placements.map((placement) => (
            <span key={placement} className="bg-surface-2 px-2 py-0.5 text-[11px] text-ink-soft">
              {PLACEMENT_LABELS[placement as AdPlacement] ?? placement}
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (row) => (
        <StatusBadge tone={row.isActive ? 'success' : 'neutral'}>
          {row.isActive ? 'Ativo' : 'Inativo'}
        </StatusBadge>
      )
    },
    {
      key: 'window',
      header: 'Janela',
      render: (row) => (
        <span className="text-ink-faint">{formatWindow(row.startAt, row.endAt)}</span>
      )
    },
    {
      key: 'metrics',
      header: 'Impr. / cliques',
      render: (row) => (
        <span className="text-ink-soft">
          {row.impressions} / {row.clicks}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={vm.isToggling}
            onClick={() => vm.toggleActive({ id: row.id, isActive: !row.isActive })}
          >
            {row.isActive ? 'Desativar' : 'Ativar'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => vm.openEdit(row)}>
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={vm.isRemoving}
            onClick={() => {
              if (window.confirm(`Excluir o anúncio "${row.title}"?`)) vm.remove(row.id)
            }}
          >
            Excluir
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8">
      <AdminPageHeader
        title="Anúncios"
        subtitle="House ads, patrocínio direto e links de afiliado — posições, janela de exibição e rotação por peso. Curadoria restrita a administrator (o backend revalida)."
        actions={
          <Button variant="primary" size="sm" onClick={vm.openCreate}>
            + Novo anúncio
          </Button>
        }
      />

      {actionError ? (
        <p role="alert" className="text-xs font-semibold text-danger">
          {actionError instanceof Error ? actionError.message : 'Falha ao executar a ação.'}
        </p>
      ) : null}

      {vm.isFormOpen ? (
        <AdFormPanel
          key={vm.editing?.id ?? 'new'}
          adId={vm.editing?.id}
          initial={vm.editing ? toAdFormValues(vm.editing) : undefined}
          onClose={vm.closeForm}
        />
      ) : null}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-ink">Anúncios cadastrados</h2>
            <span className="text-[13px] text-ink-faint">{vm.total} anúncios</span>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ads-status-filter" className="text-[12px] font-bold text-ink-faint">
                Status
              </label>
              <select
                id="ads-status-filter"
                className={INPUT_CLASS}
                value={vm.status}
                onChange={(event) => vm.selectStatus(event.target.value as AdminAdsStatusFilter)}
              >
                {STATUS_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="ads-kind-filter" className="text-[12px] font-bold text-ink-faint">
                Tipo
              </label>
              <select
                id="ads-kind-filter"
                className={INPUT_CLASS}
                value={vm.kind}
                onChange={(event) => vm.selectKind(event.target.value as AdKind | 'all')}
              >
                {KIND_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="ads-placement-filter" className="text-[12px] font-bold text-ink-faint">
                Posição
              </label>
              <select
                id="ads-placement-filter"
                className={INPUT_CLASS}
                value={vm.placement}
                onChange={(event) => vm.selectPlacement(event.target.value as AdPlacement | 'all')}
              >
                {PLACEMENT_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <AdminTable
          columns={columns}
          rows={vm.rows}
          rowKey={(row) => row.id}
          isLoading={vm.isLoading}
          emptyMessage={
            vm.isError
              ? 'Não foi possível carregar os anúncios.'
              : 'Nenhum anúncio encontrado. Crie o primeiro!'
          }
        />

        {vm.totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-border p-4">
            <Button
              variant="dark"
              size="sm"
              disabled={vm.page <= 1}
              onClick={() => vm.setPage(vm.page - 1)}
            >
              ← Anterior
            </Button>
            <span className="text-[13px] text-ink-soft">
              Página <span className="font-semibold text-ink">{vm.page}</span> de {vm.totalPages}
            </span>
            <Button
              variant="dark"
              size="sm"
              disabled={vm.page >= vm.totalPages}
              onClick={() => vm.setPage(vm.page + 1)}
            >
              Próxima →
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  )
}
