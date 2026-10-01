// Path: packages/modules/content/src/domain/events/post-events.ts
// Eventos que o módulo content publica via EventBus (@digimon/contracts).
import type { DomainEvent } from '@digimon/contracts'
import type { Post } from '../entities/post'

export type PostEventType = 'post.created' | 'post.updated' | 'post.published' | 'post.archived'

export interface PostEvent extends DomainEvent {
  type: PostEventType
  postId: string
  slug: string
}

export function postEvent(type: PostEventType, post: Post): PostEvent {
  return {
    type,
    occurredAt: new Date(),
    postId: post.id,
    slug: post.slug
  }
}
