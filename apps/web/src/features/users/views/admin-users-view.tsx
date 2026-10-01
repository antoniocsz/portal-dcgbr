// Path: apps/web/src/features/users/views/admin-users-view.tsx
// View do painel de usuários: tabela (nome, papel, email, status, ações) com
// troca de papel e ativação/desativação. Só JSX — estado vem do ViewModel.
'use client'

import type { Role } from '@digimon/contracts'
import { Button, Card } from '@/components'
import { AdminMetrics } from '@/features/admin/views/admin-metrics'
import { AdminPageHeader } from '@/features/admin/views/admin-page-header'
import { AdminRoleBadge, AdminStatusBadge } from '@/features/admin/views/admin-badge'
import { AdminTable } from '@/features/admin/views/admin-table'
import type { AdminTableColumn } from '@/features/admin/views/admin-table'
import type { AdminMetric } from '@/features/admin/model/types'
import { useAdminUsersViewModel } from '../viewmodel/use-admin-users-view-model'
import type { UserView } from '../model/types'

const ROLES: Role[] = ['administrator', 'editor', 'member']

const ROLE_LABELS: Record<Role, string> = {
  administrator: 'Administrator',
  editor: 'Editor',
  member: 'Member'
}

function countByRole(users: UserView[], role: Role): number {
  return users.filter((user) => user.role === role).length
}

export function AdminUsersView() {
  const vm = useAdminUsersViewModel()

  const metrics: AdminMetric[] = [
    { label: 'Total de usuários', value: String(vm.total), trend: 'cadastrados', trendTone: 'neutral' },
    { label: 'Membros', value: String(countByRole(vm.users, 'member')), trend: 'nesta página', trendTone: 'neutral' },
    { label: 'Editores', value: String(countByRole(vm.users, 'editor')), trend: 'nesta página', trendTone: 'neutral' },
    { label: 'Administradores', value: String(countByRole(vm.users, 'administrator')), trend: 'nesta página', trendTone: 'neutral' }
  ]

  const columns: AdminTableColumn<UserView>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (row) => <span className="font-semibold text-ink">{row.name}</span>
    },
    { key: 'role', header: 'Papel', render: (row) => <AdminRoleBadge role={row.role} /> },
    { key: 'email', header: 'Email', render: (row) => <span>{row.email}</span> },
    { key: 'status', header: 'Status', render: (row) => <AdminStatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Ações',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`role-${row.id}`}>
            Papel de {row.name}
          </label>
          <select
            id={`role-${row.id}`}
            value={row.role}
            onChange={(event) => vm.assignRole(row.id, event.target.value as Role)}
            className="h-9 border border-border bg-surface px-2 text-[13px] text-ink"
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
          <Button
            variant="dark"
            size="sm"
            onClick={() => vm.setStatus(row.id, row.status === 'active' ? 'inactive' : 'active')}
          >
            {row.status === 'active' ? 'Desativar' : 'Ativar'}
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8">
      <AdminPageHeader title="Usuários" subtitle="Gerencie contas, papéis e status." />

      <form onSubmit={vm.searchSubmit} className="flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="admin-users-search">
          Buscar usuários
        </label>
        <input
          id="admin-users-search"
          type="search"
          placeholder="Buscar por nome ou email"
          value={vm.search}
          onChange={(event) => vm.updateSearch(event.target.value)}
          className="h-10 min-w-0 flex-1 border border-border bg-surface px-3 text-sm text-ink placeholder:text-ink-faint"
        />
        <label className="sr-only" htmlFor="admin-users-role">
          Filtrar por papel
        </label>
        <select
          id="admin-users-role"
          value={vm.roleFilter}
          onChange={(event) => vm.updateRoleFilter(event.target.value as Role | '')}
          className="h-10 border border-border bg-surface px-3 text-sm text-ink"
        >
          <option value="">Todos os papéis</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm">
          Buscar
        </Button>
      </form>

      {vm.error ? <p className="text-sm text-danger">{vm.error}</p> : null}

      <AdminMetrics metrics={metrics} />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-5">
          <h2 className="font-display text-lg font-bold text-ink">Todos os usuários</h2>
          <span className="text-[13px] text-ink-faint">{vm.total} usuários cadastrados</span>
        </div>
        <AdminTable
          columns={columns}
          rows={vm.users}
          rowKey={(row) => row.id}
          isLoading={vm.isLoading}
          emptyMessage="Nenhum usuário encontrado."
        />
      </Card>
    </div>
  )
}
