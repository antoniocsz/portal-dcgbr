// Path: packages/modules/content/src/use-cases/list-posts.ts
// Listagem SEO-friendly com filtros (category, status, paginação).
// Público: força status published — nunca vaza rascunhos/review.
// Admin/Editor: podem filtrar por qualquer status.
import type { PaginatedResult } from '@digimon/contracts'
import { isEditorial, type Actor } from '../domain/actor'
import type { Post } from '../domain/entities/post'
import type { ListPostsParams, PostRepository } from '../domain/repositories/post-repository'
import { listPostsSchema, type ListPostsInput } from './schemas'

export interface ListPostsCommand {
  input: ListPostsInput
  actor?: Actor | null
}

export class ListPostsUseCase {
  constructor(private readonly repo: PostRepository) {}

  async execute(command: ListPostsCommand): Promise<PaginatedResult<Post>> {
    const parsed = listPostsSchema.parse(command.input)

    const editorial = isEditorial(command.actor ?? null)
    const status = editorial ? parsed.status ?? 'published' : 'published'
    const params: ListPostsParams = {
      page: parsed.page ?? 1,
      pageSize: parsed.pageSize ?? 20
    }
    if (parsed.category) params.category = parsed.category
    if (status) params.status = status

    return this.repo.list(params)
  }
}
