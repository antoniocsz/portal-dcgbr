// Path: packages/modules/users/src/domain/repositories/user-repository.ts
// Interface do repositório de usuários — implementações: Prisma (infra) e in-memory (testes).
// Não multi-tenant (ADR-004): sem tenantId nas queries.
// Contrato também satisfaz a porta UserAccountRepository do módulo auth (DIP):
// create com id opcional e updatePassword são usados pelo fluxo de auth.
import type { PaginatedResult, Role } from '@digimon/contracts'
import type { CreateUserData, User } from '../entities/user'
import type { UserStatus } from '../entities/user'

export interface ListUsersParams {
  search?: string
  role?: Role
  status?: UserStatus
  page?: number
  pageSize?: number
}

export interface UserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: CreateUserData): Promise<User>
  update(user: User): Promise<void>
  updatePassword(id: string, passwordHash: string): Promise<void>
  list(params: ListUsersParams): Promise<PaginatedResult<User>>
}
