// Path: apps/web/src/features/content/views/news-list-view.tsx
// View da listagem pública de notícias com filtro por categoria (via URL).
'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { PostCategory } from '../model/types'
import { useNewsList } from '../viewmodels/use-news-list'
import { NewsGrid } from './news-grid'

const FILTERS: { value?: PostCategory; label: string }[] = [
  { label: 'Todas' },
  { value: 'news', label: 'Notícias' },
  { value: 'article', label: 'Matérias' },
  { value: 'curiosity', label: 'Curiosidades' },
  { value: 'simulator', label: 'Simuladores' }
]

export interface NewsListViewProps {
  category?: PostCategory | undefined
}

export function NewsListView({ category }: NewsListViewProps) {
  const { posts, total, isLoading, isError, refetch } = useNewsList(category)

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10 lg:px-12">
      <header className="flex flex-col gap-2.5 pb-6">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl lg:text-[40px]">
          Notícias
        </h1>
        <p className="max-w-3xl text-base leading-6 text-ink-soft">
          Últimas notícias, matérias e curiosidades sobre o Digimon Card Game no Brasil.
        </p>
      </header>

      <nav className="flex flex-wrap gap-3 pb-8" aria-label="Filtrar por categoria">
        {FILTERS.map((filter) => {
          const active = filter.value === category
          return (
            <Link
              key={filter.label}
              href={filter.value ? `/noticias?categoria=${filter.value}` : '/noticias'}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'px-4 py-2.5 text-[13px] font-semibold transition-colors',
                active ? 'bg-primary text-white' : 'bg-surface-2 text-ink hover:bg-surface'
              )}
            >
              {filter.label}
            </Link>
          )
        })}
      </nav>

      <p className="pb-4 text-[13px] text-ink-faint">
        {isLoading ? 'Carregando…' : `${total} publicações`}
      </p>

      <NewsGrid posts={posts} isLoading={isLoading} isError={isError} onRetry={refetch} />
    </div>
  )
}
