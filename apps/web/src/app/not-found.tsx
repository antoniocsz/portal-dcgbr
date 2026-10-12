// Path: apps/web/src/app/not-found.tsx
// Página 404 do portal (App Router). Server Component: o Next responde HTTP 404 e
// injeta <meta name="robots" content="noindex"> automaticamente em páginas 404.
import type { Metadata } from 'next'
import Link from 'next/link'
import { buttonVariants } from '@/components'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Página não encontrada',
  robots: { index: false, follow: false }
}

const SECTIONS = [
  { href: '/noticias', label: 'Notícias' },
  { href: '/cartas', label: 'Cartas' },
  { href: '/decks', label: 'Decks' },
  { href: '/torneios', label: 'Torneios' }
] as const

export default function NotFound() {
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col items-center px-4 py-20 text-center lg:px-12 lg:py-28">
      <p
        aria-hidden="true"
        className="font-display text-6xl font-extrabold leading-none text-primary lg:text-8xl"
      >
        404
      </p>
      <h1 className="mt-6 font-display text-2xl font-bold text-ink lg:text-4xl">
        Página não encontrada
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-ink-soft lg:text-[15px] lg:leading-[23px]">
        Este conteúdo não existe ou foi removido. Confira o endereço ou explore as seções do
        portal.
      </p>

      <div className="mt-8">
        <Link href="/" className={buttonVariants({ variant: 'primary' })}>
          Voltar para a home
        </Link>
      </div>

      <nav
        aria-label="Seções do portal"
        className="mt-10 w-full max-w-lg border-t border-border pt-8"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Explore</p>
        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {SECTIONS.map((section) => (
            <li key={section.href}>
              <Link
                href={section.href}
                className={cn(
                  'text-sm font-medium text-ink-soft transition-colors hover:text-ink',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60'
                )}
              >
                {section.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  )
}
