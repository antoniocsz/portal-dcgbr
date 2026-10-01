// Path: apps/web/src/features/users/model/types.ts
// Tipos do domínio de users consumidos pela UI (espelham os DTOs dos módulos).
import type { PaginatedResult, Role } from '@digimon/contracts'
import type { UserView } from '@digimon/users'

export type { UserView }
export type { Role }

export interface UpdateProfileForm {
  name: string
  avatarUrl: string
}

export interface AssignRoleForm {
  role: Role
}

export type ListUsersResult = PaginatedResult<UserView>

export interface UserListQuery {
  search?: string
  role?: Role
  status?: 'active' | 'inactive'
  page?: number
  pageSize?: number
}
