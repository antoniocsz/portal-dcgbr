// Path: apps/web/src/features/content/views/simulator-card.tsx
// View presentacional: card de simulador da comunidade (a partir de um post da
// categoria simulator). Capa (ou gradiente de fallback), título, resumo e
// ações: "Acessar" (externalUrl) e "Ler matéria".
import Link from 'next/link'
import { buttonVariants, Tag } from '@/components'
import type { PostSummary } from '../model/types'

const FALLBACK_ART =
  'bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,#6FA0A8_0%,#0C0C0E_100%)]'

export interface SimulatorCardProps {
  post: PostSummary
}

export function SimulatorCard({ post }: SimulatorCardProps) {
  return (
    <article className="flex flex-col border border-border bg-surface transition-colors hover:border-ink-faint">
      {post.coverImage ? (
        <img
          src={post.coverImage}
          alt=""
          className="h-[150px] w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className={`flex h-[150px] items-center justify-center ${FALLBACK_ART}`} aria-hidden="true" />
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <Tag className="uppercase tracking-wider">Simulador</Tag>
        <h3 className="font-display text-lg font-bold text-ink">{post.title}</h3>
        {post.excerpt ? (
          <p className="text-sm leading-5 text-ink-soft">{post.excerpt}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-2 pt-1">
          {post.externalUrl ? (
            <a
              href={post.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: 'sm' })}
            >
              Acessar
            </a>
          ) : null}
          <Link href={`/noticias/${post.slug}`} className={buttonVariants({ variant: 'dark', size: 'sm' })}>
            Ler matéria
          </Link>
        </div>
      </div>
    </article>
  )
}
