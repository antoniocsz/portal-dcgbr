// Path: packages/modules/users/src/use-cases/user-view.ts
// Converte a entidade User no DTO público — nunca expõe passwordHash.
import type { User } from '../domain/entities/user'
import type { UserView } from './schemas'

export function toUserView(user: User): UserView {
  return {
    id: user.id,
    email: user.email,
    name: user.data.name,
    avatarUrl: user.data.avatarUrl,
    role: user.role,
    status: user.status,
    emailVerifiedAt: user.data.emailVerifiedAt,
    createdAt: user.data.createdAt,
    updatedAt: user.data.updatedAt
  }
}
