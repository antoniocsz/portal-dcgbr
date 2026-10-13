// Path: apps/web/src/features/users/views/profile-view.tsx
// View do perfil do membro: cabeçalho, cartão de identidade, métricas, abas
// (decks/torneios/comentários) e privacidade. Identidade vem de `useProfileViewModel`
// (GET /users/me); métricas e abas vêm de `useProfileActivity` (dados reais).
'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import type { Role } from '@digimon/contracts'
import { Avatar, Button, Card, MetricCard, StatusBadge } from '@/components'
import type { StatusTone } from '@/components'
import type { CommentTargetType } from '@/features/comments/model/comments-api'
import { STATUS_LABELS as DECK_STATUS_LABELS } from '@/features/decks/model/types'
import type { DeckStatus } from '@/features/decks/model/types'
import {
  formatTournamentDate,
  statusLabel as tournamentStatusLabel,
  statusTone
} from '@/features/tournaments/viewmodels/tournament-view'
import { useProfileActivity } from '../viewmodel/use-profile-activity'
import { useProfileViewModel } from '../viewmodel/use-profile-view-model'
import { DeleteAccountModal } from './delete-account-modal'

const ROLE_LABELS: Record<Role, string> = {
  administrator: 'Administrator',
  editor: 'Editor',
  member: 'Member'
}

const ROLE_TONES: Record<Role, StatusTone> = {
  administrator: 'success',
  editor: 'warning',
  member: 'info'
}

const DECK_STATUS_TONES: Record<DeckStatus, StatusTone> = {
  draft: 'warning',
  published: 'success'
}

const COMMENT_TARGET_LABELS: Record<CommentTargetType, string> = {
  post: 'Post',
  card: 'Carta',
  deck: 'Deck'
}

const TABS = ['Decks', 'Torneios', 'Comentários'] as const
type ProfileTab = (typeof TABS)[number]

function formatJoined(value: Date | string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

function formatDate(value: string | Date): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface ActivityListProps {
  isLoading: boolean
  error: string | null
  isEmpty: boolean
  children: ReactNode
}

/** Estados compartilhados das abas: carregando, erro e lista vazia. */
function ActivityList({ isLoading, error, isEmpty, children }: ActivityListProps) {
  if (isLoading) {
    return (
      <Card className="p-6" aria-busy="true">
        <p className="text-sm text-ink-soft">Carregando…</p>
      </Card>
    )
  }
  if (error) {
    return (
      <Card className="p-6">
        <p className="text-sm text-danger">{error}</p>
      </Card>
    )
  }
  if (isEmpty) {
    return (
      <Card className="p-6">
        <p className="text-sm text-ink-faint">Nada por aqui ainda.</p>
      </Card>
    )
  }
  return <>{children}</>
}

const LINK_CLASS =
  'truncate font-display text-base font-bold text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60'

export function ProfileView() {
  const {
    profile,
    form,
    isLoading,
    isSaving,
    error,
    saved,
    updateField,
    submit,
    isExportingData,
    isDeletingAccount,
    deleteModalOpen,
    privacyError,
    downloadMyData,
    openDeleteModal,
    closeDeleteModal,
    confirmDeleteAccount
  } = useProfileViewModel()
  const activity = useProfileActivity()
  const [tab, setTab] = useState<ProfileTab>('Decks')
  const [editing, setEditing] = useState(false)

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-4 py-10 lg:px-12">
        <p className="text-sm text-ink-soft">Carregando perfil…</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-4 py-10 lg:px-12">
        <p className="text-sm text-danger">{error ?? 'Não foi possível carregar o perfil.'}</p>
      </div>
    )
  }

  const showStats = !activity.isLoading && !activity.error

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-8 lg:px-12 lg:py-12">
      <header className="flex flex-col gap-2 pb-6">
        <h1 className="font-display text-3xl font-bold text-ink lg:text-[40px]">
          Perfil — {profile.name}
        </h1>
        <p className="text-base text-ink-soft">Perfil público do membro na comunidade.</p>
      </header>

      <Card className="flex flex-col gap-6 p-5 lg:flex-row lg:items-center lg:gap-7 lg:p-7">
        <Avatar name={profile.name} size="lg" tone="solid" className="size-16 lg:size-24" />
        <div className="flex flex-1 flex-col gap-3">
          <StatusBadge tone={ROLE_TONES[profile.role]}>
            {ROLE_LABELS[profile.role].toUpperCase()}
          </StatusBadge>
          <h2 className="font-display text-2xl font-bold text-ink">{profile.name}</h2>
          <p className="text-sm text-ink-soft">
            Membro desde {formatJoined(profile.createdAt)}
            {showStats ? (
              <>
                {' · '}
                {activity.stats.decks} decks · {activity.stats.tournaments} torneios ·{' '}
                {activity.stats.comments} comentários
              </>
            ) : null}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" onClick={() => setEditing((value) => !value)}>
              {editing ? 'Fechar edição' : 'Editar perfil'}
            </Button>
          </div>
        </div>
      </Card>

      {editing ? (
        <Card className="mt-4 flex flex-col gap-3 p-5">
          <h3 className="font-display text-lg font-bold text-ink">Editar perfil</h3>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {saved ? <p className="text-sm text-success">Perfil salvo.</p> : null}
          <form onSubmit={submit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-[13px] font-bold text-ink">
              Nome
              <input
                type="text"
                required
                minLength={2}
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className="h-10 border border-border bg-surface px-3 text-sm font-normal text-ink"
              />
            </label>
            <label className="flex flex-col gap-1 text-[13px] font-bold text-ink">
              URL do avatar (opcional)
              <input
                type="url"
                value={form.avatarUrl}
                onChange={(event) => updateField('avatarUrl', event.target.value)}
                className="h-10 border border-border bg-surface px-3 text-sm font-normal text-ink"
              />
            </label>
            <div>
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? 'Salvando…' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4" aria-label="Métricas">
        <MetricCard label="Decks" value={showStats ? activity.stats.decks : '—'} />
        <MetricCard label="Torneios" value={showStats ? activity.stats.tournaments : '—'} />
        <MetricCard label="Comentários" value={showStats ? activity.stats.comments : '—'} />
        <MetricCard label="Publicações" value={showStats ? activity.stats.publications : '—'} />
      </section>

      <section className="mt-8 flex flex-col gap-4">
        <div className="flex gap-2" role="tablist" aria-label="Seções do perfil">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              onClick={() => setTab(item)}
              className={
                tab === item
                  ? 'bg-primary px-3 py-2 text-[13px] font-semibold text-white'
                  : 'bg-surface-2 px-3 py-2 text-[13px] font-semibold text-ink-soft hover:text-ink'
              }
            >
              {item}
            </button>
          ))}
        </div>

        {tab === 'Decks' ? (
          <ActivityList
            isLoading={activity.isLoading}
            error={activity.error}
            isEmpty={activity.decks.length === 0}
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {activity.decks.map((deck) => (
                <Card
                  key={deck.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <Link href={`/decks/${deck.slug}`} className={LINK_CLASS}>
                      {deck.name}
                    </Link>
                    <span className="text-[13px] text-ink-soft">
                      {deck.format} · {deck.cardCount} cartas
                    </span>
                  </div>
                  <StatusBadge tone={DECK_STATUS_TONES[deck.status]}>
                    {DECK_STATUS_LABELS[deck.status]}
                  </StatusBadge>
                </Card>
              ))}
            </div>
          </ActivityList>
        ) : tab === 'Torneios' ? (
          <ActivityList
            isLoading={activity.isLoading}
            error={activity.error}
            isEmpty={activity.tournaments.length === 0}
          >
            <div className="flex flex-col gap-3">
              {activity.tournaments.map((tournament) => (
                <Card
                  key={tournament.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <Link href={`/torneios/${tournament.slug}`} className={LINK_CLASS}>
                      {tournament.name}
                    </Link>
                    <span className="text-[13px] text-ink-soft">
                      {tournament.format} · {formatTournamentDate(tournament.dateStart)} ·{' '}
                      {tournament.location}
                    </span>
                  </div>
                  <StatusBadge tone={statusTone(tournament.status)}>
                    {tournamentStatusLabel(tournament.status)}
                  </StatusBadge>
                </Card>
              ))}
            </div>
          </ActivityList>
        ) : (
          <ActivityList
            isLoading={activity.isLoading}
            error={activity.error}
            isEmpty={activity.comments.length === 0}
          >
            <div className="flex flex-col gap-3">
              {activity.comments.map((comment) => (
                <Card key={comment.id} className="flex flex-col gap-2 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-surface-2 px-2 py-[3px] text-[11px] font-semibold text-ink-soft">
                      {COMMENT_TARGET_LABELS[comment.targetType]}
                    </span>
                    <span className="text-xs text-ink-faint">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-[13px] leading-[19px] text-ink-soft">{comment.body}</p>
                </Card>
              ))}
            </div>
          </ActivityList>
        )}
      </section>

      <section className="mt-8 flex flex-col gap-4" aria-label="Privacidade e meus dados">
        <h2 className="font-display text-xl font-bold text-ink">Privacidade e meus dados</h2>

        <Card className="flex flex-col gap-5 p-5 lg:p-7">
          <div className="flex flex-col gap-1">
            <h3 className="font-display text-base font-bold text-ink">Baixar meus dados</h3>
            <p className="text-sm text-ink-soft">
              Exporta em um arquivo .json tudo o que guardamos sobre você: perfil, comentários,
              decks, torneios e publicações na comunidade. Direito de portabilidade (LGPD, art. 18).
            </p>
          </div>
          <div>
            <Button size="sm" onClick={downloadMyData} disabled={isExportingData}>
              {isExportingData ? 'Preparando…' : 'Baixar meus dados'}
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col gap-5 p-5 lg:p-7">
          <div className="flex flex-col gap-1">
            <h3 className="font-display text-base font-bold text-danger">Excluir minha conta</h3>
            <p className="text-sm text-ink-soft">
              Desativa a conta e anonimiza seus dados pessoais. O conteúdo que você criou permanece
              no site como &ldquo;Usuário removido&rdquo;. Ação permanente — direito de eliminação
              (LGPD, art. 18).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="dark"
              size="sm"
              className="border-danger text-danger hover:border-danger hover:text-danger"
              onClick={openDeleteModal}
              disabled={isDeletingAccount}
            >
              Excluir conta
            </Button>
            <Link
              href="/privacidade"
              className="text-[13px] font-semibold text-primary hover:underline"
            >
              Ver Política de Privacidade
            </Link>
          </div>
        </Card>

        {privacyError && !deleteModalOpen ? (
          <p role="alert" className="text-sm text-danger">
            {privacyError}
          </p>
        ) : null}
      </section>

      <DeleteAccountModal
        open={deleteModalOpen}
        isPending={isDeletingAccount}
        error={privacyError}
        onConfirm={confirmDeleteAccount}
        onClose={closeDeleteModal}
      />
    </div>
  )
}
