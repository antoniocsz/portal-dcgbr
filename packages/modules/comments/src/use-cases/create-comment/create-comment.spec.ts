// packages/modules/comments/src/use-cases/create-comment/create-comment.spec.ts
// Critério: anônimo não comenta (UnauthorizedError); member cria e publica comment.created.

import { InMemoryEventBus, UnauthorizedError } from '@digimon/contracts'
import { describe, expect, it } from 'vitest'
import type { CommentActor } from '../../domain/actor'
import { MemoryCommentRepository } from '../../test/memory-comment-repository'
import { CreateCommentUseCase } from './create-comment'

const member: CommentActor = { userId: 'user-1', role: 'member' }

describe('CreateCommentUseCase', () => {
  it('lança UnauthorizedError quando anônimo tenta comentar', async () => {
    const useCase = new CreateCommentUseCase(new MemoryCommentRepository(), new InMemoryEventBus())

    await expect(
      useCase.execute({ actor: null, targetType: 'post', targetId: 'post-1', body: 'Olá!' })
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('cria comentário visível como member logado e publica comment.created', async () => {
    const repo = new MemoryCommentRepository()
    const bus = new InMemoryEventBus()
    const events: string[] = []
    bus.subscribe('comment.created', (event) => { events.push(event.type) })
    const useCase = new CreateCommentUseCase(repo, bus)

    const comment = await useCase.execute({
      actor: member,
      targetType: 'post',
      targetId: 'post-1',
      body: '  Primeiro comentário  '
    })

    expect(comment.authorId).toBe('user-1')
    expect(comment.body).toBe('Primeiro comentário')
    expect(comment.status).toBe('visible')
    expect(events).toEqual(['comment.created'])
  })

  it('rejeita corpo vazio', async () => {
    const useCase = new CreateCommentUseCase(new MemoryCommentRepository(), new InMemoryEventBus())

    await expect(
      useCase.execute({ actor: member, targetType: 'deck', targetId: 'deck-1', body: '   ' })
    ).rejects.toThrow('Comentário não pode ser vazio')
  })
})
