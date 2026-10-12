// Path: apps/web/src/app/(member)/torneios/novo/page.tsx
// Criar torneio (Member publica direto). Layout largo de trabalho (container
// full-width + cabeçalho próprio), consistente com `torneios/[slug]/editar` e
// `decks/novo` — sem o card estreito do AuthShell. O gate de login vive no
// layout do grupo `(member)`.
import type { Metadata } from 'next'
import { TournamentFormView } from '@/features/tournaments/views'

export const metadata: Metadata = {
  title: 'Publicar torneio',
  description: 'Publique seu torneio do Digimon TCG direto, sem revisão.',
  robots: { index: false }
}

export default function CriarTorneioPage() {
  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-10 lg:px-12">
      <header className="flex flex-col gap-2 pb-6">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl lg:text-[40px]">
          Publicar torneio
        </h1>
        <p className="max-w-3xl text-base leading-6 text-ink-soft">
          Publique um torneio direto — Member publica sem revisão.
        </p>
      </header>
      <TournamentFormView />
    </div>
  )
}
