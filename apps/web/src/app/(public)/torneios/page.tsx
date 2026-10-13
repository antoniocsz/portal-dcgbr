// Path: apps/web/src/app/(public)/torneios/page.tsx
// Torneios no Brasil (SEO-first): metadata + TournamentsListView com filtros
// por status (Todos/Próximos/Finalizados) e botão "+ Publicar torneio"
// (member publica direto). Cancelados não é público — não é listado aqui.
import type { Metadata } from 'next'
import Link from 'next/link'
import { TournamentsListView } from '@/features/tournaments/views'
import type { TournamentStatus } from '@/features/tournaments/model/types'

export const metadata: Metadata = {
  title: 'Torneios no Brasil — Digimon TCG',
  description:
    'Agenda de torneios do Digimon TCG no Brasil: próximos e finalizados. Members publicam torneios direto, sem revisão.',
  alternates: { canonical: '/torneios' },
  openGraph: {
    title: 'Torneios no Brasil — Digimon TCG',
    description: 'Agenda colaborativa de torneios do Digimon TCG no Brasil.',
    type: 'website'
  }
}

const VALID_STATUSES: TournamentStatus[] = ['published', 'finished']

export default async function TorneiosPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; from?: string }>
}) {
  const { status, from } = await searchParams
  const statusFilter = VALID_STATUSES.find((value) => value === status)
  const today = new Date().toISOString().slice(0, 10)

  return (
    <TournamentsListView
      {...(statusFilter ? { status: statusFilter } : {})}
      {...(from ? { from } : {})}
      today={today}
      title="Torneios no Brasil"
      description="Agenda colaborativa: Members publicam torneios direto, sem revisão."
      headerAction={
        <Link
          href="/torneios/novo"
          className="inline-flex bg-primary px-4.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          + Publicar torneio
        </Link>
      }
    />
  )
}
