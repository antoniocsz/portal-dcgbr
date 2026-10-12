// Path: apps/web/src/app/(member)/torneios/[slug]/editar/page.tsx
// Editar dados do torneio (dono OU Admin/Editor). O gate de login vive no
// layout do grupo `(member)`; o gate de DONO é server-side: busca o torneio com
// o cookie de sessão (SSR) e trata um resultado discriminado (ok | not-found |
// error) — `not-found` (404 da API) → notFound() (404 real); `error`
// (transitório: 5xx/timeout) → NÃO dá 404, renderiza a View (o client trata o
// erro de fetch); `ok` → gate canManage; sem permissão → redirect para o detalhe
// (o GET /tournaments/:slug é 404 sem vazar cancelado de terceiros). Layout
// largo de trabalho (container full-width + cabeçalho).
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { ACCESS_TOKEN_COOKIE } from '@digimon/auth'
import { apiBaseUrl } from '@/lib/api-base'
import { getSession, type CurrentSession } from '@/lib/session'
import { TournamentFormView } from '@/features/tournaments/views'
import type { Tournament } from '@/features/tournaments/model/types'

export const metadata: Metadata = {
  title: 'Editar torneio',
  description: 'Edite nome, formato, local, datas e descrição do seu torneio de Digimon TCG.',
  robots: { index: false }
}

type FetchResult<T> = { status: 'ok'; data: T } | { status: 'not-found' } | { status: 'error' }

async function fetchTournament(slug: string): Promise<FetchResult<Tournament>> {
  const store = await cookies()
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value

  try {
    const response = await fetch(`${apiBaseUrl}/tournaments/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
      ...(token ? { headers: { cookie: `${ACCESS_TOKEN_COOKIE}=${token}` } } : {})
    })
    if (response.status === 404) return { status: 'not-found' }
    if (!response.ok) return { status: 'error' }
    return { status: 'ok', data: (await response.json()) as Tournament }
  } catch {
    return { status: 'error' }
  }
}

function canManage(tournament: Tournament, session: CurrentSession): boolean {
  return (
    session.role === 'administrator' ||
    session.role === 'editor' ||
    tournament.organizerId === session.userId
  )
}

export default async function EditarTorneioPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getSession()
  const result = await fetchTournament(slug)

  if (result.status === 'not-found') notFound()
  if (result.status === 'ok' && (!session || !canManage(result.data, session))) {
    redirect(`/torneios/${slug}`)
  }

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-10 lg:px-12">
      <header className="flex flex-col gap-2 pb-6">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl lg:text-[40px]">
          Editar torneio
        </h1>
        <p className="max-w-3xl text-base leading-6 text-ink-soft">
          Atualize nome, formato, local, datas e descrição. As alterações são publicadas direto.
        </p>
      </header>
      <TournamentFormView mode="edit" slug={slug} />
    </div>
  )
}
