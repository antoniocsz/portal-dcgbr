// Path: apps/web/src/features/users/model/users-api.ts
// Repository de users: chamadas à API separada (ADR-007) via @digimon/api-client
// (envia o cookie httpOnly de sessão). Sem hooks, sem JSX — camada Model.
import { apiClient } from '@/lib/api-base'
import type { AssignRoleForm, ListUsersResult, UpdateProfileForm, UserListQuery, UserView } from './types'

export const usersApi = {
  getProfile(): Promise<{ user: UserView }> {
    return apiClient.get('/users/me')
  },
  updateProfile(input: UpdateProfileForm): Promise<{ user: UserView }> {
    return apiClient.patch('/users/me', input)
  },
  listUsers(query: UserListQuery = {}): Promise<ListUsersResult> {
    const params = new URLSearchParams()
    if (query.search) params.set('search', query.search)
    if (query.role) params.set('role', query.role)
    if (query.status) params.set('status', query.status)
    if (query.page) params.set('page', String(query.page))
    if (query.pageSize) params.set('pageSize', String(query.pageSize))
    const qs = params.toString()
    return apiClient.get(qs ? `/users?${qs}` : '/users')
  },
  assignRole(userId: string, input: AssignRoleForm): Promise<{ user: UserView }> {
    return apiClient.patch(`/users/${userId}/role`, input)
  },
  setStatus(userId: string, status: 'active' | 'inactive'): Promise<{ user: UserView }> {
    return apiClient.patch(`/users/${userId}/status`, { status })
  }
}
