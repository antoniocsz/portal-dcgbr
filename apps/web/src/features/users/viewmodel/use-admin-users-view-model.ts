// Path: apps/web/src/features/users/viewmodel/use-admin-users-view-model.ts
'use client'

// ViewModel: orquestra o painel admin de usuários — listagem, busca,
// atribuição de papel e ativação/desativação.
import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { usersApi } from '../model/users-api'
import type { Role, UserListQuery, UserView } from '../model/types'

export interface AdminUsersViewModel {
  users: UserView[]
  total: number
  search: string
  roleFilter: Role | ''
  isLoading: boolean
  error: string | null
  updateSearch: (value: string) => void
  updateRoleFilter: (value: Role | '') => void
  searchSubmit: (event: FormEvent) => void
  assignRole: (userId: string, role: Role) => Promise<void>
  setStatus: (userId: string, status: 'active' | 'inactive') => Promise<void>
}

function buildQuery(search: string, role: Role | ''): UserListQuery {
  const query: UserListQuery = {}
  if (search.trim()) query.search = search.trim()
  if (role) query.role = role
  return query
}

export function useAdminUsersViewModel(): AdminUsersViewModel {
  const [users, setUsers] = useState<UserView[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | ''>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback((query: UserListQuery = {}): void => {
    setIsLoading(true)
    setError(null)
    usersApi
      .listUsers(query)
      .then((result) => {
        setUsers(result.items)
        setTotal(result.total)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Erro ao listar usuários')
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const updateSearch = (value: string): void => setSearch(value)
  const updateRoleFilter = (value: Role | ''): void => {
    setRoleFilter(value)
    load(buildQuery(search, value))
  }

  const searchSubmit = (event: FormEvent): void => {
    event.preventDefault()
    load(buildQuery(search, roleFilter))
  }

  const assignRole = async (userId: string, role: Role): Promise<void> => {
    await usersApi.assignRole(userId, { role })
    load(buildQuery(search, roleFilter))
  }

  const setStatus = async (userId: string, status: 'active' | 'inactive'): Promise<void> => {
    await usersApi.setStatus(userId, status)
    load(buildQuery(search, roleFilter))
  }

  return {
    users,
    total,
    search,
    roleFilter,
    isLoading,
    error,
    updateSearch,
    updateRoleFilter,
    searchSubmit,
    assignRole,
    setStatus
  }
}
