// Barrel público do módulo @digimon/content — única porta de entrada do pacote.
// Exporta somente o público. Nunca imports internos de outros módulos (ESLint boundaries).

// Domínio
export { EDITORIAL_ROLES, isEditorial, requireEditorial } from './domain/actor'
export type { Actor } from './domain/actor'
export { Post, slugify, SLUG_PATTERN } from './domain/entities/post'
export type { CreatePostData, PostData, UpdatePostData } from './domain/entities/post'
export { CATEGORIES, getCategory } from './domain/entities/category'
export type { Category } from './domain/entities/category'
export { postEvent } from './domain/events/post-events'
export type { PostEvent, PostEventType } from './domain/events/post-events'
export type { ListPostsParams, PostRepository } from './domain/repositories/post-repository'
export type { CategoryRepository } from './domain/repositories/category-repository'

// Use cases
export { CreatePostUseCase } from './use-cases/create-post'
export type { CreatePostCommand } from './use-cases/create-post'
export { UpdatePostUseCase } from './use-cases/update-post'
export type { UpdatePostCommand } from './use-cases/update-post'
export { SubmitForReviewUseCase } from './use-cases/submit-for-review'
export type { SubmitForReviewCommand } from './use-cases/submit-for-review'
export { PublishPostUseCase } from './use-cases/publish-post'
export type { PublishPostCommand } from './use-cases/publish-post'
export { ArchivePostUseCase } from './use-cases/archive-post'
export type { ArchivePostCommand } from './use-cases/archive-post'
export { GetPostUseCase } from './use-cases/get-post'
export type { GetPostCommand } from './use-cases/get-post'
export { ListPostsUseCase } from './use-cases/list-posts'
export type { ListPostsCommand } from './use-cases/list-posts'
export { GetSimulatorsPageUseCase } from './use-cases/get-simulators-page'
export type { SimulatorsPage } from './use-cases/get-simulators-page'

// Schemas de entrada (usados pelos route handlers do apps/web)
export { createPostSchema, listPostsSchema, postCategorySchema, updatePostSchema } from './use-cases/schemas'
export type { CreatePostInput, ListPostsInput, UpdatePostInput } from './use-cases/schemas'

// Infra
export { PrismaCategoryRepository } from './infra/repositories/prisma-category-repository'
export { PrismaPostRepository } from './infra/repositories/prisma-post-repository'
