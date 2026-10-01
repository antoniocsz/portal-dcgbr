// packages/modules/comments/src/domain/events/comment-events.ts
// Eventos publicados pelo módulo comments via EventBus (in-process, ADR-005).

import type { CommentTargetType, DomainEvent } from '@digimon/contracts'

export interface CommentEventPayload {
  commentId: string
  authorId: string
  targetType: CommentTargetType
  targetId: string
}

export class CommentCreatedEvent implements DomainEvent {
  readonly type = 'comment.created'
  readonly occurredAt = new Date()

  constructor(public readonly payload: CommentEventPayload) {}
}

export class CommentHiddenEvent implements DomainEvent {
  readonly type = 'comment.hidden'
  readonly occurredAt = new Date()

  constructor(public readonly payload: CommentEventPayload) {}
}

export class CommentDeletedEvent implements DomainEvent {
  readonly type = 'comment.deleted'
  readonly occurredAt = new Date()

  constructor(public readonly payload: CommentEventPayload) {}
}
