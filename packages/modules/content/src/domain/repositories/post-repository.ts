// Path: packages/modules/content/src/domain/repositories/post-repository.ts
// Interface do repositório de posts — implementações: Prisma (infra) e in-memory (testes).
// Não multi-tenant (ADR-004): sem tenantId nas queries.
import type { PaginatedResult, PostCategory, PostStatus } from '@digimon/contracts'
import type { Post, PostData } from '../entities/post'

export interface ListPostsParams {
  category?: PostCategory
  status?: PostStatus
  page?: number
  pageSize?: number
}

export interface PostRepository {
  create(data: PostData): Promise<void>
  update(post: Post): Promise<void>
  findById(id: string): Promise<Post | null>
  findBySlug(slug: string): Promise<Post | null>
  list(params: ListPostsParams): Promise<PaginatedResult<Post>>
}
