// Path: apps/web/src/features/users/model/users-api.ts
// Repository de users: chamadas fetch aos route handlers protegidos
// (envia o cookie httpOnly de sessão). Sem hooks, sem JSX — camada Model.
import type { AssignRoleForm, ListUsersResult, UpdateProfileForm, UserListQuery, UserView } from './types'

const API = '/api/users'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    credentials: 'include'
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as
      | { error?: { code: string; message: string } }
      | null
    throw new Error(body?.error?.message ?? `Erro ${res.status}`)
  }
  return (await res.json()) as T
}

export const usersApi = {
  getProfile(): Promise<{ user: UserView }> {
    return request('/me')
  },
  updateProfile(input: UpdateProfileForm): Promise<{ user: UserView }> {
    return request('/me', { method: 'PATCH', body: JSON.stringify(input) })
  },
  listUsers(query: UserListQuery = {}): Promise<ListUsersResult> {
    const params = new URLSearchParams()
    if (query.search) params.set('search', query.search)
    if (query.role) params.set('role', query.role)
    if (query.status) params.set('status', query.status)
    if (query.page) params.set('page', String(query.page))
    if (query.pageSize) params.set('pageSize', String(query.pageSize))
    const qs = params.toString()
    return request(qs ? `/?${qs}` : '/')
  },
  assignRole(userId: string, input: AssignRoleForm): Promise<{ user: UserView }> {
    return request(`/${userId}/role`, { method: 'PATCH', body: JSON.stringify(input) })
  },
  setStatus(userId: string, status: 'active' | 'inactive'): Promise<{ user: UserView }> {
    return request(`/${userId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
  }
}
