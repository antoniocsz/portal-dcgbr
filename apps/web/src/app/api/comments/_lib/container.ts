// apps/web/src/app/api/comments/_lib/container.ts
// Composição (DIP): instancia os use cases com o repositório Prisma e o EventBus
// in-process. O handler de API não conhece implementações — só os use cases.
// O PrismaClient é o singleton único do @digimon/database (driver adapter).

import { InMemoryEventBus } from '@digimon/contracts'
import {
  CreateCommentUseCase,
  DeleteCommentUseCase,
  ListAllCommentsUseCase,
  ListCommentsUseCase,
  ModerateCommentUseCase,
  PrismaCommentRepository,
  UpdateCommentUseCase
} from '@digimon/comments'
import { prisma } from '@digimon/database'

const eventBus = new InMemoryEventBus()
const commentRepository = new PrismaCommentRepository(prisma)

export const commentsContainer = {
  create: new CreateCommentUseCase(commentRepository, eventBus),
  list: new ListCommentsUseCase(commentRepository),
  listAll: new ListAllCommentsUseCase(commentRepository),
  update: new UpdateCommentUseCase(commentRepository),
  delete: new DeleteCommentUseCase(commentRepository, eventBus),
  moderate: new ModerateCommentUseCase(commentRepository, eventBus)
}
