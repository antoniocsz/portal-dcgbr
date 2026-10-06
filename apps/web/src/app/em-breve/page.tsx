// Path: apps/web/src/app/em-breve/page.tsx
// Página "Em breve" (coming-soon) — exibida quando o site-gate está ativo.
// Sem indexação (noindex) e sem o chrome público (SiteChrome a exclui).
import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Em breve',
  robots: { index: false, follow: false }
}

export default function EmBrevePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-6 text-center">
      <Image
        src="/dcg-logo.png"
        alt="Digimon Card Game"
        width={1280}
        height={364}
        priority
        className="h-12 w-auto"
      />
      <h1 className="font-display text-3xl font-bold text-ink lg:text-[40px]">Em breve</h1>
      <p className="max-w-md text-sm leading-6 text-ink-soft lg:text-[15px] lg:leading-[23px]">
        O portal Digimon TCG Brasil está sendo preparado. Em breve: notícias, cartas, decks e
        torneios em português.
      </p>
      <p className="text-xs text-ink-faint">© {new Date().getFullYear()} Digimon TCG Brasil</p>
    </main>
  )
}
