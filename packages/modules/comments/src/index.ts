// Barrel público do módulo @digimon/comments
// Exporte somente o que é público. Nunca imports internos de outros módulos.

export * from './domain/actor'
export * from './domain/entities/comment'
export * from './domain/events/comment-events'
export * from './domain/repositories/comment-repository'
export * from './use-cases/create-comment/create-comment'
export * from './use-cases/list-comments/list-comments'
export * from './use-cases/list-all-comments/list-all-comments'
export * from './use-cases/update-comment/update-comment'
export * from './use-cases/delete-comment/delete-comment'
export * from './use-cases/moderate-comment/moderate-comment'
export * from './infra/repositories/prisma-comment-repository'
