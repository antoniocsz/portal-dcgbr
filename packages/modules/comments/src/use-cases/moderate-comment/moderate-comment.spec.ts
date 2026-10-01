// packages/modules/comments/src/use-cases/moderate-comment/moderate-comment.spec.ts
// Critério: Admin/Editor moderam qualquer comentário (ocultar/exibir).

import { ForbiddenError, InMemoryEventBus, NotFoundError, UnauthorizedError } from '@digimon/contracts'
import { describe, expect, it } from 'vitest'
import type { CommentActor } from '../../domain/actor'
import { Comment } from '../../domain/entities/comment'
import { MemoryCommentRepository } from '../../test/memory-comment-repository'
import { ModerateCommentUseCase } from './moderate-comment'

const member: CommentActor = { userId: 'user-1', role: 'member' }
const editor: CommentActor = { userId: 'editor-1', role: 'editor' }
const admin: CommentActor = { userId: 'admin-1', role: 'administrator' }

describe('ModerateCommentUseCase', () => {
  it('lança UnauthorizedError para anônimo', async () => {
    const useCase = new ModerateCommentUseCase(
      new MemoryCommentRepository(),
      new InMemoryEventBus()
    )

    await expect(
      useCase.execute({ actor: null, commentId: 'c-1', action: 'hide' })
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('lança ForbiddenError para member', async () => {
    const repo = new MemoryCommentRepository()
    const comment = Comment.create({ authorId: 'user-9', targetType: 'post', targetId: 'post-1', body: 'original' })
    await repo.create(comment)
    const useCase = new ModerateCommentUseCase(repo, new InMemoryEventBus())

    await expect(
      useCase.execute({ actor: member, commentId: comment.id, action: 'hide' })
    ).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('editor oculta comentário de outro autor e publica comment.hidden', async () => {
    const repo = new MemoryCommentRepository()
    const comment = Comment.create({ authorId: 'user-9', targetType: 'post', targetId: 'post-1', body: 'original' })
    await repo.create(comment)
    const bus = new InMemoryEventBus()
    const events: string[] = []
    bus.subscribe('comment.hidden', (event) => { events.push(event.type) })
    const useCase = new ModerateCommentUseCase(repo, bus)

    const hidden = await useCase.execute({ actor: editor, commentId: comment.id, action: 'hide' })

    expect(hidden.status).toBe('hidden')
    expect(events).toEqual(['comment.hidden'])
  })

  it('administrator exibe comentário oculto (sem evento)', async () => {
    const repo = new MemoryCommentRepository()
    const comment = Comment.create({ authorId: 'user-9', targetType: 'post', targetId: 'post-1', body: 'original' })
    comment.hide()
    await repo.create(comment)
    const bus = new InMemoryEventBus()
    const events: string[] = []
    bus.subscribe('comment.hidden', (event) => { events.push(event.type) })
    const useCase = new ModerateCommentUseCase(repo, bus)

    const shown = await useCase.execute({ actor: admin, commentId: comment.id, action: 'show' })

    expect(shown.status).toBe('visible')
    expect(events).toEqual([])
  })

  it('lança NotFoundError para comentário inexistente', async () => {
    const useCase = new ModerateCommentUseCase(
      new MemoryCommentRepository(),
      new InMemoryEventBus()
    )

    await expect(
      useCase.execute({ actor: admin, commentId: 'nao-existe', action: 'hide' })
    ).rejects.toBeInstanceOf(NotFoundError)
  })
})
