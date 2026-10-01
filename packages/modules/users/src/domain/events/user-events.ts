// Path: packages/modules/users/src/domain/events/user-events.ts
// Eventos que o módulo users publica via EventBus (@digimon/contracts).
import type { DomainEvent, Role } from '@digimon/contracts'

export type UserEventType = 'user.updated' | 'role.assigned'

export interface UserUpdatedEvent extends DomainEvent {
  type: 'user.updated'
  userId: string
}

export interface RoleAssignedEvent extends DomainEvent {
  type: 'role.assigned'
  userId: string
  role: Role
  assignedBy: string
}

export type UserEvent = UserUpdatedEvent | RoleAssignedEvent

export function userUpdatedEvent(userId: string): UserUpdatedEvent {
  return {
    type: 'user.updated',
    occurredAt: new Date(),
    userId
  }
}

export function roleAssignedEvent(input: { userId: string; role: Role; assignedBy: string }): RoleAssignedEvent {
  return {
    type: 'role.assigned',
    occurredAt: new Date(),
    userId: input.userId,
    role: input.role,
    assignedBy: input.assignedBy
  }
}
