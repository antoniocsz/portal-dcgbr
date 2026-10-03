// Path: apps/web/src/features/content/views/simulators-view.tsx
// View da página de Simuladores (MVVM — consome useSimulators):
// destaque = post mais recente da categoria simulator; grade = demais posts.
// Estados de loading, erro e vazio.
'use client'

import Link from 'next/link'
import { buttonVariants, Tag } from '@/components'
import { useSimulators } from '../viewmodels/use-simulators'
import { SimulatorCard } from './simulator-card'

const FALLBACK_ART =
  'bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,#C22B33_0%,#0C0C0E_100%)]'

export function SimulatorsView() {
  const { featured, community, total, isLoading, isError, error } = useSimulators()

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10 lg:px-12">
      <header className="flex flex-col gap-2.5 pb-6">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl lg:text-[40px]">
          Simuladores
        </h1>
        <p className="max-w-3xl text-base leading-6 text-ink-soft">
          Jogue Digimon TCG online: o simulador oficial Alysium e as ferramentas criadas pela
          comunidade.
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-[230px] animate-pulse bg-surface" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-[280px] animate-pulse bg-surface" />
            <div className="h-[280px] animate-pulse bg-surface" />
            <div className="h-[280px] animate-pulse bg-surface" />
          </div>
        </div>
      ) : null}

      {isError ? (
        <p className="border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error instanceof Error ? error.message : 'Não foi possível carregar os simuladores.'}
        </p>
      ) : null}

      {!isLoading && !isError && total === 0 ? (
        <div className="border border-border bg-surface px-6 py-12 text-center">
          <p className="text-sm text-ink-soft">
            Nenhum simulador publicado ainda. Em breve: Alysium e ferramentas da comunidade.
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && featured ? (
        <section className="pb-6" aria-label="Simulador em destaque">
          <article className="flex flex-col gap-7 border border-border bg-surface p-5 lg:flex-row lg:p-7">
            {featured.coverImage ? (
              <img
                src={featured.coverImage}
                alt=""
                className="h-[170px] w-full object-cover lg:h-[230px] lg:w-[380px] lg:shrink-0"
              />
            ) : (
              <div
                className={`flex h-[170px] items-center justify-center lg:h-[230px] lg:w-[380px] lg:shrink-0 ${FALLBACK_ART}`}
                aria-hidden="true"
              />
            )}
            <div className="flex flex-1 flex-col justify-center gap-3">
              <Tag className="bg-primary-soft font-bold uppercase tracking-widest text-primary">
                Em destaque
              </Tag>
              <h2 className="font-display text-xl font-bold text-ink lg:text-[28px]">
                {featured.title}
              </h2>
              {featured.excerpt ? (
                <p className="text-sm leading-6 text-ink-soft lg:text-[15px] lg:leading-[23px]">
                  {featured.excerpt}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3 pt-1">
                {featured.externalUrl ? (
                  <a
                    href={featured.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ size: 'sm' })}
                  >
                    Acessar
                  </a>
                ) : null}
                <Link
                  href={`/noticias/${featured.slug}`}
                  className={buttonVariants({ variant: 'dark', size: 'sm' })}
                >
                  Ler matéria
                </Link>
              </div>
            </div>
          </article>
        </section>
      ) : null}

      {!isLoading && !isError && community.length > 0 ? (
        <section className="flex flex-col gap-4" aria-label="Simuladores da comunidade">
          <h2 className="font-display text-xl font-bold text-ink lg:text-[26px]">
            Simuladores da comunidade
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {community.map((post) => (
              <SimulatorCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
