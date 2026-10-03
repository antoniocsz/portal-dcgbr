// packages/modules/comments/src/use-cases/list-comments/list-comments.spec.ts
// Critério: listagem por target paginada (pública, apenas visíveis por padrão).

import { describe, expect, it } from 'vitest'
import { Comment } from '../../domain/entities/comment'
import { MemoryCommentRepository } from '../../test/memory-comment-repository'
import { ListCommentsUseCase } from './list-comments'

describe('ListCommentsUseCase', () => {
  it('lista apenas comentários visíveis do target, paginado e mais recentes primeiro', async () => {
    const repo = new MemoryCommentRepository()
    for (let i = 1; i <= 5; i++) {
      const comment = Comment.create({ authorId: 'user-1', targetType: 'post', targetId: 'post-1', body: `c${i}` })
      await repo.create(comment)
    }
    // outro target não deve aparecer
    const outro = Comment.create({ authorId: 'user-1', targetType: 'card', targetId: 'card-1', body: 'card' })
    await repo.create(outro)
    // oculto não deve aparecer na listagem pública
    const oculto = Comment.create({ authorId: 'user-1', targetType: 'post', targetId: 'post-1', body: 'oculto' })
    oculto.hide()
    await repo.create(oculto)

    const useCase = new ListCommentsUseCase(repo)
    const result = await useCase.execute({ targetType: 'post', targetId: 'post-1', page: 1, pageSize: 2 })

    expect(result.total).toBe(5)
    expect(result.items).toHaveLength(2)
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(2)
    expect(result.items[0]?.comment.body).toBe('c5')
    expect(result.items[1]?.comment.body).toBe('c4')
    expect(result.items[0]?.authorName).toBe('Autor')
  })

  it('retorna página seguinte corretamente', async () => {
    const repo = new MemoryCommentRepository()
    for (let i = 1; i <= 5; i++) {
      const comment = Comment.create({ authorId: 'user-1', targetType: 'deck', targetId: 'deck-1', body: `d${i}` })
      await repo.create(comment)
    }
    const useCase = new ListCommentsUseCase(repo)
    const result = await useCase.execute({ targetType: 'deck', targetId: 'deck-1', page: 2, pageSize: 2 })

    expect(result.total).toBe(5)
    expect(result.items).toHaveLength(2)
    expect(result.items[0]?.comment.body).toBe('d3')
  })

  it('usa defaults de paginação quando não informados', async () => {
    const repo = new MemoryCommentRepository()
    const comment = Comment.create({ authorId: 'user-1', targetType: 'post', targetId: 'post-1', body: 'unico' })
    await repo.create(comment)
    const useCase = new ListCommentsUseCase(repo)
    const result = await useCase.execute({ targetType: 'post', targetId: 'post-1' })

    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(20)
    expect(result.items).toHaveLength(1)
  })
})
