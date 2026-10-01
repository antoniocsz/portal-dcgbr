// Path: packages/modules/users/src/use-cases/list-users/list-users-use-case.ts
// Listagem de usuários (painel admin) com filtros — somente administrator.
import type { PaginatedResult } from '@digimon/contracts'
import { ForbiddenError } from '@digimon/contracts'
import type { UserRepository, ListUsersParams } from '../../domain/repositories/user-repository'
import { toUserView } from '../user-view'
import { listUsersSchema, type UserView } from '../schemas'
import { parseOrThrow } from '../parse-or-throw'

export interface ListUsersUseCaseDeps {
  users: UserRepository
}

export class ListUsersUseCase {
  constructor(private readonly deps: ListUsersUseCaseDeps) {}

  async execute(actorId: string, input: unknown): Promise<PaginatedResult<UserView>> {
    const actor = await this.deps.users.findById(actorId)
    if (!actor || actor.role !== 'administrator') {
      throw new ForbiddenError('Somente administrador pode listar usuários')
    }

    const data = parseOrThrow(listUsersSchema, input)
    const params: ListUsersParams = {}
    if (data.search !== undefined) params.search = data.search
    if (data.role !== undefined) params.role = data.role
    if (data.status !== undefined) params.status = data.status
    if (data.page !== undefined) params.page = data.page
    if (data.pageSize !== undefined) params.pageSize = data.pageSize

    const result = await this.deps.users.list(params)

    return {
      items: result.items.map(toUserView),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize
    }
  }
}
