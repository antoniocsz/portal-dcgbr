// Path: apps/web/src/app/(member)/decks/[slug]/editar/page.tsx
// Editar deck (dono). Layout largo de trabalho (deck builder) — container
// full-width + cabeçalho próprio, sem o card estreito do AuthShell (o formulário
// em 2 colunas precisa de largura). O gate de Member vive no layout do grupo
// `(member)`. Gate de dono: o GET /decks/:slug é público para decks publicados,
// então aqui só o dono edita — não-dono (ou deck inexistente) nunca vê o form.
// O fetch SSR encaminha o cookie de sessão para o dono enxergar o próprio rascunho.
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { ACCESS_TOKEN_COOKIE } from '@digimon/auth'
import { apiBaseUrl } from '@/lib/api-base'
import { getSession } from '@/lib/session'
import { DeckFormView } from '@/features/decks/views'
import type { Deck } from '@/features/decks/model/types'

export const metadata: Metadata = {
  title: 'Editar deck',
  description: 'Edite seu deck do Digimon TCG: metadados, main, egg e capa.',
  robots: { index: false }
}

async function fetchDeck(slug: string): Promise<Deck | null> {
  const store = await cookies()
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value

  try {
    const response = await fetch(`${apiBaseUrl}/decks/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
      ...(token ? { headers: { cookie: `${ACCESS_TOKEN_COOKIE}=${token}` } } : {})
    })
    if (!response.ok) return null
    return (await response.json()) as Deck
  } catch {
    return null
  }
}

export default async function EditarDeckPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getSession()
  const deck = await fetchDeck(slug)

  if (!deck) notFound()
  if (!session || deck.ownerId !== session.userId) redirect(`/decks/${slug}`)

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
