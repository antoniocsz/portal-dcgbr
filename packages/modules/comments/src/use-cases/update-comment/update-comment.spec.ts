// packages/modules/comments/src/use-cases/update-comment/update-comment.spec.ts
// Critério: autor não edita comentário de outro (ForbiddenError).

import { ForbiddenError, NotFoundError, UnauthorizedError } from '@digimon/contracts'
import { describe, expect, it } from 'vitest'
import type { CommentActor } from '../../domain/actor'
import { Comment } from '../../domain/entities/comment'
import { MemoryCommentRepository } from '../../test/memory-comment-repository'
import { UpdateCommentUseCase } from './update-comment'

const author: CommentActor = { userId: 'user-1', role: 'member' }
const otherMember: CommentActor = { userId: 'user-2', role: 'member' }

describe('UpdateCommentUseCase', () => {
  it('lança UnauthorizedError para anônimo', async () => {
    const useCase = new UpdateCommentUseCase(new MemoryCommentRepository())

    await expect(
      useCase.execute({ actor: null, commentId: 'c-1', body: 'novo' })
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('autor edita o próprio comentário', async () => {
    const repo = new MemoryCommentRepository()
    const comment = Comment.create({ authorId: 'user-1', targetType: 'post', targetId: 'post-1', body: 'original' })
    await repo.create(comment)
    const useCase = new UpdateCommentUseCase(repo)

    const updated = await useCase.execute({ actor: author, commentId: comment.id, body: 'editado' })

    expect(updated.body).toBe('editado')
    expect(updated.id).toBe(comment.id)
  })

  it('lança ForbiddenError quando não-autor tenta editar', async () => {
    const repo = new MemoryCommentRepository()
    const comment = Comment.create({ authorId: 'user-1', targetType: 'post', targetId: 'post-1', body: 'original' })
    await repo.create(comment)
    const useCase = new UpdateCommentUseCase(repo)

    await expect(
      useCase.execute({ actor: otherMember, commentId: comment.id, body: 'hack' })
    ).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('lança NotFoundError para comentário inexistente', async () => {
    const useCase = new UpdateCommentUseCase(new MemoryCommentRepository())

    await expect(
      useCase.execute({ actor: author, commentId: 'nao-existe', body: 'x' })
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it('não permite editar comentário removido (soft-deleted)', async () => {
    const repo = new MemoryCommentRepository()
    const comment = Comment.create({ authorId: 'user-1', targetType: 'post', targetId: 'post-1', body: 'original' })
    comment.softDelete()
    await repo.create(comment)
    const useCase = new UpdateCommentUseCase(repo)

    await expect(
      useCase.execute({ actor: author, commentId: comment.id, body: 'editado' })
    ).rejects.toThrow('não pode ser editado')
  })
})
