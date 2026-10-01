// Path: packages/modules/auth/src/use-cases/user-view.ts
// Converte a conta (porta DIP) no DTO público do usuário — nunca expõe passwordHash.
import type { UserAccountRecord } from '../domain/repositories/user-account-repository'
import type { AuthUserView } from './schemas'

export function toAuthUserView(user: UserAccountRecord): AuthUserView {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role
  }
}
