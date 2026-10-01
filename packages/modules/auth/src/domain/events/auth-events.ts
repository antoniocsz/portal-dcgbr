// Path: packages/modules/auth/src/domain/events/auth-events.ts
// Eventos que o módulo auth publica via EventBus (@digimon/contracts).
import type { DomainEvent, Role } from '@digimon/contracts'

export type AuthEventType =
  | 'user.created'
  | 'password.reset.requested'
  | 'password.reset'

export interface UserCreatedEvent extends DomainEvent {
  type: 'user.created'
  userId: string
  email: string
  role: Role
}

export interface PasswordResetRequestedEvent extends DomainEvent {
  type: 'password.reset.requested'
  userId: string
}

export interface PasswordResetEvent extends DomainEvent {
  type: 'password.reset'
  userId: string
}

export type AuthEvent = UserCreatedEvent | PasswordResetRequestedEvent | PasswordResetEvent

export function userCreatedEvent(input: {
  userId: string
  email: string
  role: Role
}): UserCreatedEvent {
  return {
    type: 'user.created',
    occurredAt: new Date(),
    userId: input.userId,
    email: input.email,
    role: input.role
  }
}

export function passwordResetRequestedEvent(userId: string): PasswordResetRequestedEvent {
  return {
    type: 'password.reset.requested',
    occurredAt: new Date(),
    userId
  }
}

export function passwordResetEvent(userId: string): PasswordResetEvent {
  return {
    type: 'password.reset',
    occurredAt: new Date(),
    userId
  }
}
