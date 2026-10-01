// Path: apps/web/src/app/(public)/noticias/page.tsx
// Listagem pública de notícias (SEO-first): metadata + NewsListView com filtro
// por categoria lido da query string (?categoria=news|article|curiosity|simulator).
import type { Metadata } from 'next'
import { NewsListView } from '@/features/content/views'
import type { PostCategory } from '@/features/content/model/types'

const CATEGORIES: PostCategory[] = ['news', 'article', 'curiosity', 'simulator']

export const metadata: Metadata = {
  title: 'Notícias',
  description:
    'Últimas notícias, matérias e curiosidades sobre o Digimon Card Game no Brasil.',
  alternates: { canonical: '/noticias' }
}

export default async function NoticiasPage({
  searchParams
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categoria } = await searchParams
  const category = CATEGORIES.find((value) => value === categoria)

  return <NewsListView category={category} />
}
