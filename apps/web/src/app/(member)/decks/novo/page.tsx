// Path: apps/web/src/app/(member)/decks/novo/page.tsx
// Criar deck (Member publica direto ou salva rascunho). Layout largo de
// trabalho (deck builder): container full-width + cabeçalho próprio, sem o card
// estreito do AuthShell — o formulário em 2 colunas precisa de largura.
import type { Metadata } from 'next'
import { DeckFormView } from '@/features/decks/views'

export const metadata: Metadata = {
  title: 'Criar deck',
  description: 'Monte seu deck do Digimon TCG: busque cartas do catálogo e publique direto.',
  robots: { index: false }
}

export default function CriarDeckPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10 lg:px-12">
      <header className="flex flex-col gap-2 pb-6">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl lg:text-[40px]">
          Criar deck
        </h1>
        <p className="max-w-3xl text-base leading-6 text-ink-soft">
          Publique direto, sem revisão. Monte o main e o egg com a busca do catálogo e edite
          depois quando quiser.
        </p>
      </header>
      <DeckFormView />
    </div>
  )
}
