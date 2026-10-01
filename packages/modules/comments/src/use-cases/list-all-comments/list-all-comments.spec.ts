// packages/modules/comments/src/use-cases/list-all-comments/list-all-comments.spec.ts
// Critério: listagem global (moderação) — admin/editor veem qualquer status
// com nome do autor; member não-moderador é bloqueado.

import { describe, expect, it } from 'vitest'
import { Comment } from '../../domain/entities/comment'
import { MemoryCommentRepository } from '../../test/memory-comment-repository'
import { ListAllCommentsUseCase } from './list-all-comments'

describe('ListAllCommentsUseCase', () => {
  it('admin lista todos os comentários (qualquer status) com autor', async () => {
    const repo = new MemoryCommentRepository()
    const visivel = Comment.create({ authorId: 'user-1', targetType: 'post', targetId: 'post-1', body: 'ok' })
    await repo.create(visivel)
    const oculto = Comment.create({ authorId: 'user-2', targetType: 'card', targetId: 'card-1', body: 'hidden' })
    oculto.hide()
    await repo.create(oculto)

    const useCase = new ListAllCommentsUseCase(repo)
    const result = await useCase.execute({ actor: { userId: 'admin', role: 'administrator' } })

    expect(result.total).toBe(2)
    expect(result.items.map((item) => item.authorName)).toEqual(['Autor', 'Autor'])
  })

  it('filtra por status quando informado', async () => {
    const repo = new MemoryCommentRepository()
    const a = Comment.create({ authorId: 'u', targetType: 'post', targetId: 'p', body: 'a' })
    await repo.create(a)
    const b = Comment.create({ authorId: 'u', targetType: 'post', targetId: 'p', body: 'b' })
    b.hide()
    await repo.create(b)

    const useCase = new ListAllCommentsUseCase(repo)
    const hidden = await useCase.execute({ actor: { userId: 'admin', role: 'editor' }, status: 'hidden' })
    expect(hidden.total).toBe(1)
    expect(hidden.items[0]?.comment.body).toBe('b')
  })

  it('member não-moderador é bloqueado (ForbiddenError)', async () => {
    const repo = new MemoryCommentRepository()
    const useCase = new ListAllCommentsUseCase(repo)
    await expect(
      useCase.execute({ actor: { userId: 'member', role: 'member' } })
    ).rejects.toThrow(/Apenas moderadores/)
  })
})
