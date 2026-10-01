// Path: apps/web/src/app/api/posts/_lib/use-cases.ts
// Composition root: instancia os use cases do módulo @digimon/content
// com o PrismaClient e o EventBus in-process (ADR-005).
import { InMemoryEventBus } from '@digimon/contracts'
import { prisma } from '@digimon/database'
import {
  ArchivePostUseCase,
  CreatePostUseCase,
  GetPostUseCase,
  GetSimulatorsPageUseCase,
  ListPostsUseCase,
  PrismaCategoryRepository,
  PrismaPostRepository,
  PublishPostUseCase,
  SubmitForReviewUseCase,
  UpdatePostUseCase
} from '@digimon/content'

export const eventBus = new InMemoryEventBus()

const postRepo = new PrismaPostRepository(prisma)
const categoryRepo = new PrismaCategoryRepository()

export const posts = {
  create: new CreatePostUseCase(postRepo, eventBus),
  update: new UpdatePostUseCase(postRepo, eventBus),
  submitForReview: new SubmitForReviewUseCase(postRepo, eventBus),
  publish: new PublishPostUseCase(postRepo, eventBus),
  archive: new ArchivePostUseCase(postRepo, eventBus),
  get: new GetPostUseCase(postRepo),
  list: new ListPostsUseCase(postRepo),
  simulators: new GetSimulatorsPageUseCase(postRepo)
}

export const categories = categoryRepo
