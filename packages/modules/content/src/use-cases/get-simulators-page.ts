// Path: packages/modules/content/src/use-cases/get-simulators-page.ts
// Conteúdo consolidado sobre simuladores (Alysium oficial 2026 + fan-made):
// a categoria `simulator` agrega todos os posts published dessa categoria.
import type { Category } from '../domain/entities/category'
import { getCategory } from '../domain/entities/category'
import type { Post } from '../domain/entities/post'
import type { PostRepository } from '../domain/repositories/post-repository'

export interface SimulatorsPage {
  category: Category
  posts: Post[]
}

export class GetSimulatorsPageUseCase {
  constructor(private readonly repo: PostRepository) {}

  async execute(): Promise<SimulatorsPage> {
    // 'simulator' é valor fixo do enum PostCategory — sempre existe em CATEGORIES.
    const category = getCategory('simulator')!
    const result = await this.repo.list({ category: 'simulator', status: 'published', page: 1, pageSize: 50 })
    return { category, posts: result.items }
  }
}
