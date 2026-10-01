// Path: packages/modules/content/src/infra/repositories/prisma-category-repository.ts
// Implementação de CategoryRepository. Categorias editoriais são fixas
// (value-objects do domínio) — sem tabela no banco (decisão registrada no status.md).
import type { PostCategory } from '@digimon/contracts'
import { CATEGORIES, getCategory, type Category } from '../../domain/entities/category'
import type { CategoryRepository } from '../../domain/repositories/category-repository'

export class PrismaCategoryRepository implements CategoryRepository {
  async list(): Promise<Category[]> {
    return [...CATEGORIES]
  }

  async findById(id: PostCategory): Promise<Category | null> {
    return getCategory(id) ?? null
  }
}
