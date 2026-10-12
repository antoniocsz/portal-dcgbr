// Path: apps/web/src/app/(member)/decks/[slug]/editar/page.tsx
// Editar deck (dono). Layout largo de trabalho (deck builder) — container
// full-width + cabeçalho próprio, sem o card estreito do AuthShell (o formulário
// em 2 colunas precisa de largura). O gate de Member vive no layout do grupo
// `(member)`. O formulário carrega o deck e salva via PATCH.
import type { Metadata } from 'next'
import { DeckFormView } from '@/features/decks/views'

export const metadata: Metadata = {
  title: 'Editar deck',
  description: 'Edite seu deck do Digimon TCG: metadados, main, egg e capa.',
  robots: { index: false }
}

export default async function EditarDeckPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10 lg:px-12">
      <header className="flex flex-col gap-2 pb-6">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl lg:text-[40px]">
          Editar deck
        </h1>
        <p className="max-w-3xl text-base leading-6 text-ink-soft">
          Ajuste os metadados, o main, o egg e a capa. As alterações são salvas no seu deck.
        </p>
      </header>
      <DeckFormView mode="edit" slug={slug} />
    </div>
  )
}
