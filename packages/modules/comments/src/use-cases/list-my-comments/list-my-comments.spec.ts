// packages/modules/comments/src/use-cases/list-my-comments/list-my-comments.spec.ts
// Critério: o titular vê apenas os próprios comentários (visíveis por padrão),
// paginado; anônimo é bloqueado.

import { describe, expect, it } from 'vitest'
import { Comment } from '../../domain/entities/comment'
import { MemoryCommentRepository } from '../../test/memory-comment-repository'
import { ListMyCommentsUseCase } from './list-my-comments'

describe('ListMyCommentsUseCase', () => {
  it('lista apenas os comentários visíveis do próprio autor', async () => {
    const repo = new MemoryCommentRepository()
    const meu1 = Comment.create({ authorId: 'user-1', targetType: 'post', targetId: 'p', body: 'meu-1' })
    await repo.create(meu1)
    const meu2 = Comment.create({ authorId: 'user-1', targetType: 'card', targetId: 'c', body: 'meu-2' })
    await repo.create(meu2)
    const outro = Comment.create({ authorId: 'user-2', targetType: 'post', targetId: 'p', body: 'outro' })
    await repo.create(outro)
    const oculto = Comment.create({ authorId: 'user-1', targetType: 'post', targetId: 'p', body: 'oculto' })
    oculto.hide()
    await repo.create(oculto)

    const useCase = new ListMyCommentsUseCase(repo)
    const result = await useCase.execute({ actor: { userId: 'user-1', role: 'member' } })

    expect(result.total).toBe(2)
    expect(result.items.every((item) => item.comment.authorId === 'user-1')).toBe(true)
    expect(result.items.map((item) => item.comment.body)).toEqual(['meu-2', 'meu-1'])
  })

  it('pagina os resultados do autor', async () => {
    const repo = new MemoryCommentRepository()
    for (let i = 1; i <= 5; i++) {
      const comment = Comment.create({ authorId: 'user-1', targetType: 'post', targetId: 'p', body: `c${i}` })
      await repo.create(comment)
    }
    const useCase = new ListMyCommentsUseCase(repo)
    const result = await useCase.execute({
      actor: { userId: 'user-1', role: 'member' },
      page: 2,
      pageSize: 2
    })

    expect(result.total).toBe(5)
    expect(result.items).toHaveLength(2)
    expect(result.page).toBe(2)
    expect(result.pageSize).toBe(2)
    expect(result.items.map((item) => item.comment.body)).toEqual(['c3', 'c2'])
  })

  it('respeita o filtro de status quando informado', async () => {
    const repo = new MemoryCommentRepository()
    const visivel = Comment.create({ authorId: 'user-1', targetType: 'post', targetId: 'p', body: 'visivel' })
    await repo.create(visivel)
    const oculto = Comment.create({ authorId: 'user-1', targetType: 'post', targetId: 'p', body: 'oculto' })
    oculto.hide()
    await repo.create(oculto)

    const useCase = new ListMyCommentsUseCase(repo)
    const result = await useCase.execute({
      actor: { userId: 'user-1', role: 'member' },
      status: 'hidden'
    })

    expect(result.total).toBe(1)
    expect(result.items[0]?.comment.body).toBe('oculto')
  })

  it('anônimo (sem actor) é bloqueado', async () => {
    const repo = new MemoryCommentRepository()
    const useCase = new ListMyCommentsUseCase(repo)
    await expect(useCase.execute({ actor: null })).rejects.toThrow(/conta logada/)
  })
})
