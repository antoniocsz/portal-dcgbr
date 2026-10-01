// Path: packages/modules/content/src/domain/repositories/category-repository.ts
// Interface do repositório de categorias editoriais.
// A implementação retorna as categorias fixas (value-objects) — sem tabela no banco.
import type { PostCategory } from '@digimon/contracts'
import type { Category } from '../entities/category'

export interface CategoryRepository {
  list(): Promise<Category[]>
  findById(id: PostCategory): Promise<Category | null>
}
