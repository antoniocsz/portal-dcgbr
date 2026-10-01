// packages/modules/comments/src/use-cases/delete-comment/delete-comment.spec.ts
// Critério: autor remove o próprio; Admin/Editor removem qualquer.

import { ForbiddenError, InMemoryEventBus, NotFoundError, UnauthorizedError } from '@digimon/contracts'
import { describe, expect, it } from 'vitest'
import type { CommentActor } from '../../domain/actor'
import { Comment } from '../../domain/entities/comment'
import { MemoryCommentRepository } from '../../test/memory-comment-repository'
import { DeleteCommentUseCase } from './delete-comment'

const author: CommentActor = { userId: 'user-1', role: 'member' }
const otherMember: CommentActor = { userId: 'user-2', role: 'member' }
const admin: CommentActor = { userId: 'admin-1', role: 'administrator' }

describe('DeleteCommentUseCase', () => {
  it('lança UnauthorizedError para anônimo', async () => {
    const useCase = new DeleteCommentUseCase(new MemoryCommentRepository(), new InMemoryEventBus())

    await expect(
      useCase.execute({ actor: null, commentId: 'c-1' })
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('autor remove o próprio comentário (soft delete) e publica comment.deleted', async () => {
    const repo = new MemoryCommentRepository()
    const comment = Comment.create({ authorId: 'user-1', targetType: 'post', targetId: 'post-1', body: 'original' })
    await repo.create(comment)
    const bus = new InMemoryEventBus()
    const events: string[] = []
    bus.subscribe('comment.deleted', (event) => { events.push(event.type) })
    const useCase = new DeleteCommentUseCase(repo, bus)

    await useCase.execute({ actor: author, commentId: comment.id })

    const removed = await repo.findById(comment.id)
    expect(removed?.status).toBe('deleted')
    expect(events).toEqual(['comment.deleted'])
  })

  it('lança ForbiddenError quando member remove comentário de outro', async () => {
    const repo = new MemoryCommentRepository()
    const comment = Comment.create({ authorId: 'user-1', targetType: 'post', targetId: 'post-1', body: 'original' })
    await repo.create(comment)
    const useCase = new DeleteCommentUseCase(repo, new InMemoryEventBus())

    await expect(
      useCase.execute({ actor: otherMember, commentId: comment.id })
    ).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('administrator remove comentário de qualquer autor', async () => {
    const repo = new MemoryCommentRepository()
    const comment = Comment.create({ authorId: 'user-1', targetType: 'post', targetId: 'post-1', body: 'original' })
    await repo.create(comment)
    const useCase = new DeleteCommentUseCase(repo, new InMemoryEventBus())

    await useCase.execute({ actor: admin, commentId: comment.id })

    const removed = await repo.findById(comment.id)
    expect(removed?.status).toBe('deleted')
  })

  it('lança NotFoundError para comentário inexistente', async () => {
    const useCase = new DeleteCommentUseCase(new MemoryCommentRepository(), new InMemoryEventBus())

    await expect(
      useCase.execute({ actor: admin, commentId: 'nao-existe' })
    ).rejects.toBeInstanceOf(NotFoundError)
  })
})
