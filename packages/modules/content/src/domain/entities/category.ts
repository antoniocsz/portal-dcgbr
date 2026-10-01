// Path: packages/modules/content/src/domain/entities/category.ts
// Category é value-object fixo derivado do enum PostCategory (@digimon/contracts).
// Decisão: categorias editoriais são fixas (news | article | curiosity | simulator)
// e não exigem tabela própria — o schema Prisma (fora do escopo) já cobre via enum.
import type { PostCategory } from '@digimon/contracts'

export interface Category {
  id: PostCategory
  slug: string
  name: string
}

export const CATEGORIES: readonly Category[] = [
  { id: 'news', slug: 'noticias', name: 'Notícias' },
  { id: 'article', slug: 'artigos', name: 'Artigos' },
  { id: 'curiosity', slug: 'curiosidades', name: 'Curiosidades' },
  { id: 'simulator', slug: 'simuladores', name: 'Simuladores' }
]

export function getCategory(id: PostCategory): Category | undefined {
  return CATEGORIES.find((c) => c.id === id)
}
