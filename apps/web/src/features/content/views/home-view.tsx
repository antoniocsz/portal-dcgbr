// Path: apps/web/src/features/content/views/home-view.tsx
// View da Home: destaque, categorias, últimas notícias e CTA.
'use client'

import Link from 'next/link'
import { AdSlot, ArrowRight, TournamentCard } from '@/components'
import { useSession } from '@/lib/use-session'
import { useHome } from '../viewmodels/use-home'
import { Hero } from './hero'
import { NewsGrid } from './news-grid'

const CATEGORIES = [
  { href: '/noticias', label: 'Todas' },
  { href: '/noticias?categoria=news', label: 'Notícias' },
  { href: '/noticias?categoria=article', label: 'Matérias' },
  { href: '/noticias?categoria=curiosity', label: 'Curiosidades' },
  { href: '/noticias?categoria=simulator', label: 'Simuladores' }
]

function HeroSkeleton() {
  return (
    <section className="border-b border-border bg-surface" aria-busy="true" aria-label="Carregando destaque">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-10 lg:px-12 lg:py-14">
        <div className="h-5 w-40 animate-pulse bg-surface-2" />
        <div className="h-9 w-full max-w-2xl animate-pulse bg-surface-2" />
        <div className="h-5 w-full max-w-xl animate-pulse bg-surface-2" />
      </div>
    </section>
  )
}

function CommunityCta() {
  return (
    <section className="bg-bg">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 bg-surface/40 px-4 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-2xl font-bold text-white lg:text-[28px]">
            Junte-se à comunidade
          </h2>
          <p className="max-w-xl text-sm text-ink-soft lg:text-[15px]">
            Crie sua conta gratuita para comentar, montar decks e publicar torneios.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center border border-border bg-surface px-4.5 text-sm font-semibold text-ink transition-colors hover:border-ink-faint"
          >
            Entrar
          </Link>
          <Link
            href="/registro"
            className="inline-flex h-11 items-center justify-center bg-primary px-4.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Criar conta grátis
          </Link>
        </div>
      </div>
    </section>
  )
}

function TournamentsSkeleton() {
  return (
    <div
      className="grid gap-5 pt-5 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Carregando torneios"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border border-border bg-surface p-4 sm:p-5"
        >
          <div className="size-14 shrink-0 animate-pulse bg-surface-2 sm:size-16" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-1/2 animate-pulse bg-surface-2" />
            <div className="h-3 w-1/3 animate-pulse bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function HomeView() {
  const { featured, latest, tournaments, isLoading, isError, tournamentsLoading, refetch } =
    useHome()
  const { user, loading: sessionLoading } = useSession()

  const showCommunityCta = !sessionLoading && !user
  const showTournaments = tournamentsLoading || tournaments.length > 0

  return (
    <div className="flex flex-col">
      {featured ? <Hero post={featured} /> : <HeroSkeleton />}

      <AdSlot
        placement="home-top"
        className="mx-auto w-full max-w-[1440px] px-4 pt-6 lg:px-12"
      />

      <section
        className="mx-auto flex w-full max-w-[1440px] flex-wrap gap-3 px-4 py-8 lg:px-12"
        aria-label="Categorias"
      >
        {CATEGORIES.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className="bg-surface-2 px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:bg-surface"
          >
            {category.label}
          </Link>
        ))}
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 pb-10 lg:px-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-xl font-bold text-ink lg:text-[26px]">Últimas notícias</h2>
          <Link
            href="/noticias"
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary transition-opacity hover:opacity-80"
          >
            Ver todas <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="pt-5">
          <NewsGrid posts={latest} isLoading={isLoading} isError={isError} onRetry={refetch} />
        </div>
      </section>

      {showTournaments ? (
        <section className="mx-auto w-full max-w-[1440px] px-4 pb-10 lg:px-12">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-xl font-bold text-ink lg:text-[26px]">
              Próximos torneios no Brasil
            </h2>
            <Link
              href="/torneios"
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary transition-opacity hover:opacity-80"
            >
              Ver todos <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {tournamentsLoading ? (
            <TournamentsSkeleton />
          ) : (
            <div className="grid gap-5 pt-5 lg:grid-cols-3">
              {tournaments.map((tournament) => (
                <TournamentCard key={tournament.name} tournament={tournament} />
              ))}
            </div>
          )}
        </section>
      ) : null}

      <AdSlot
        placement="home-infeed"
        count={2}
        className="mx-auto w-full max-w-[1440px] px-4 pb-10 lg:px-12"
      />

      {showCommunityCta ? <CommunityCta /> : null}
    </div>
  )
}
