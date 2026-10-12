// Path: apps/web/src/features/tournaments/views/tournament-detail-view.tsx
// View do detalhamento de um torneio (`/torneios/[slug]`): cabeçalho com status,
// seções de informação (formato/local/datas/organizador), resultados/classificação
// quando houver, e ações por papel (organizador OU Admin/Editor registra
// resultados e cancela; visitante não vê ações destrutivas). Só JSX — dados e
// callbacks vêm do ViewModel useTournament(slug). 404 sem vazar cancelado de
// terceiros (a API devolve NotFound).
'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { Avatar, Button, StatusBadge, Tag } from '@/components'
import type { TournamentResultEntry } from '../model/types'
import { useTournament } from '../viewmodels/use-tournament'
import { formatTournamentDate, statusLabel, statusTone } from '../viewmodels/tournament-view'
import { TournamentResultsForm } from './tournament-results-form'

export interface TournamentDetailViewProps {
  slug: string
}

interface InfoRowProps {
  label: string
  children: ReactNode
}

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-1 border border-border bg-surface px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  )
}

function ResultList({ results }: { results: TournamentResultEntry[] }) {
  const sorted = [...results].sort((a, b) => a.position - b.position)
  return (
    <>
      <table className="hidden w-full border border-border text-sm sm:table">
        <caption className="sr-only">Classificação do torneio</caption>
        <thead>
          <tr className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
            <th scope="col" className="w-20 px-4 py-3">
              Posição
            </th>
            <th scope="col" className="px-4 py-3">
              Jogador
            </th>
            <th scope="col" className="px-4 py-3">
              Deck
            </th>
            <th scope="col" className="w-24 px-4 py-3">
              Record
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((entry, index) => (
            <tr key={`${entry.position}-${entry.player}-${index}`} className="border-b border-border last:border-b-0">
              <td className="px-4 py-3 font-semibold text-ink">{entry.position}º</td>
              <td className="px-4 py-3 text-ink">{entry.player}</td>
              <td className="px-4 py-3 text-ink-soft">{entry.deck ?? '—'}</td>
              <td className="px-4 py-3 text-ink-soft">{entry.record ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ol className="flex flex-col gap-2 sm:hidden">
        {sorted.map((entry, index) => (
          <li
            key={`${entry.position}-${entry.player}-${index}`}
            className="flex flex-col gap-1 border border-border bg-surface px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="font-display text-lg font-bold text-primary">{entry.position}º</span>
              <span className="font-semibold text-ink">{entry.player}</span>
            </div>
            <p className="text-[13px] text-ink-soft">
              {entry.deck ?? 'Deck não informado'}
              {entry.record ? <span className="text-ink-faint"> · {entry.record}</span> : null}
            </p>
          </li>
        ))}
      </ol>
    </>
  )
}

export function TournamentDetailView({ slug }: TournamentDetailViewProps) {
  const vm = useTournament(slug)
  const [resultsFormOpen, setResultsFormOpen] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  if (vm.isLoading) {
    return (
      <div
        className="mx-auto flex w-full max-w-[1080px] flex-col gap-4 px-4 py-10 lg:px-12"
        aria-busy="true"
        aria-label="Carregando torneio"
      >
        <div className="h-10 w-2/3 animate-pulse bg-surface-2" />
        <div className="h-4 w-1/2 animate-pulse bg-surface-2" />
        <div className="h-40 animate-pulse bg-surface-2" />
      </div>
    )
  }

  if (vm.isNotFound) {
    return (
      <div className="mx-auto flex w-full max-w-[1080px] flex-col items-center gap-4 px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">Torneio não encontrado</h1>
        <p className="text-sm text-ink-soft">
          Este torneio não existe ou não está disponível para você.
        </p>
        <Link href="/torneios" className="text-sm font-semibold text-primary hover:underline">
          ← Voltar para torneios
        </Link>
      </div>
    )
  }

  if (vm.isError || !vm.tournament) {
    return (
      <div className="mx-auto flex w-full max-w-[1080px] flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-sm text-ink-soft">
          {vm.error instanceof Error ? vm.error.message : 'Não foi possível carregar o torneio.'}
        </p>
        <Button variant="dark" size="sm" onClick={() => void vm.refetch()}>
          Tentar novamente
        </Button>
        <Link href="/torneios" className="text-sm font-semibold text-primary hover:underline">
          ← Voltar para torneios
        </Link>
      </div>
    )
  }

  const tournament = vm.tournament
  const hasResults = Boolean(tournament.results && tournament.results.length > 0)
  const cancelError = vm.cancelError instanceof Error ? vm.cancelError.message : null

  return (
    <article className="mx-auto w-full max-w-[1080px] px-4 py-10 lg:px-12">
      <header className="flex flex-col gap-4 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">{tournament.name}</h1>
          <StatusBadge tone={statusTone(tournament.status)}>
            {statusLabel(tournament.status)}
          </StatusBadge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tag>{tournament.format}</Tag>
          <Tag>{tournament.location}</Tag>
        </div>
        {tournament.description ? (
          <p className="max-w-3xl text-base leading-6 text-ink-soft">{tournament.description}</p>
        ) : null}
      </header>

      {tournament.status === 'cancelled' ? (
        <p
          role="status"
          className="mt-6 border border-danger/40 bg-surface px-4 py-3 text-sm font-semibold text-danger"
        >
          Este torneio foi cancelado.
        </p>
      ) : null}

      <section aria-label="Informações do torneio" className="py-8">
        <h2 className="pb-3 font-display text-xl font-bold text-ink">Informações</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <InfoRow label="Formato">{tournament.format}</InfoRow>
          <InfoRow label="Local">{tournament.location}</InfoRow>
          <InfoRow label="Data de início">{formatTournamentDate(tournament.dateStart)}</InfoRow>
          {tournament.dateEnd ? (
            <InfoRow label="Data de término">{formatTournamentDate(tournament.dateEnd)}</InfoRow>
          ) : null}
          {vm.organizerName ? (
            <InfoRow label="Organizador">
              <span className="flex items-center gap-2">
                <Avatar name={vm.organizerName} size="sm" />
                {vm.organizerName}
              </span>
            </InfoRow>
          ) : null}
        </dl>
      </section>

      {vm.canManage ? (
        <div className="flex flex-wrap items-center gap-3 pb-8">
          {tournament.status !== 'cancelled' ? (
            <>
              <Link
                href={`/torneios/${tournament.slug}/editar`}
                className="text-[13px] font-semibold text-primary hover:underline"
              >
                Editar
              </Link>
              <Button
                variant="dark"
                size="sm"
                onClick={() => {
                  vm.resetAddResults()
                  setResultsFormOpen(true)
                }}
              >
                {hasResults ? 'Editar resultados' : 'Registrar resultados'}
              </Button>
            </>
          ) : null}
          {tournament.status === 'published' ? (
            <Button variant="ghost" size="sm" onClick={() => setConfirmCancel(true)}>
              Cancelar torneio
            </Button>
          ) : null}
        </div>
      ) : null}

      {confirmCancel && tournament.status === 'published' ? (
        <div
          role="alertdialog"
          aria-label="Confirmar cancelamento do torneio"
          className="mb-8 flex flex-col gap-3 border border-danger/40 bg-surface px-4 py-4"
        >
          <p className="text-sm text-ink">
            Tem certeza que deseja cancelar este torneio? Esta ação não pode ser desfeita.
          </p>
          {cancelError ? (
            <p role="alert" className="text-xs font-semibold text-danger">
              {cancelError}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="sm" disabled={vm.isCancelling} onClick={() => vm.cancel()}>
              {vm.isCancelling ? 'Cancelando…' : 'Confirmar cancelamento'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={vm.isCancelling}
              onClick={() => {
                vm.resetCancel()
                setConfirmCancel(false)
              }}
            >
              Voltar
            </Button>
          </div>
        </div>
      ) : null}

      {resultsFormOpen && vm.canManage && tournament.status !== 'cancelled' ? (
        <section aria-label="Registrar resultados" className="pb-8">
          <h2 className="pb-3 font-display text-xl font-bold text-ink">Registrar resultados</h2>
          <TournamentResultsForm
            initialResults={tournament.results}
            isPending={vm.isAddingResults}
            error={vm.addResultsError}
            success={vm.resultsAdded}
            onSubmit={vm.addResults}
            onClose={() => {
              vm.resetAddResults()
              setResultsFormOpen(false)
            }}
          />
        </section>
      ) : null}

      <section aria-label="Resultados e classificação">
        <h2 className="pb-3 font-display text-xl font-bold text-ink">Classificação</h2>
        {hasResults && tournament.results ? (
          <ResultList results={tournament.results} />
        ) : (
          <p className="border border-border bg-surface px-4 py-8 text-center text-sm text-ink-soft">
            A classificação ainda não foi publicada.
            {vm.canManage && tournament.status !== 'cancelled'
              ? ' Use "Registrar resultados" para publicá-la.'
              : ''}
          </p>
        )}
      </section>

      <div className="pt-8">
        <Link href="/torneios" className="text-sm font-semibold text-primary hover:underline">
          ← Voltar para torneios
        </Link>
      </div>
    </article>
  )
}
