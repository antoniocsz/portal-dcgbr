// Path: packages/modules/users/src/use-cases/assign-role/assign-role-use-case.ts
// Somente administrator atribui papel (regra do módulo users — ADR-004).
import type { EventBus } from '@digimon/contracts'
import { ForbiddenError, NotFoundError } from '@digimon/contracts'
import type { UserRepository } from '../../domain/repositories/user-repository'
import { roleAssignedEvent } from '../../domain/events/user-events'
import { toUserView } from '../user-view'
import { assignRoleSchema, type UserView } from '../schemas'
import { parseOrThrow } from '../parse-or-throw'

export interface AssignRoleUseCaseDeps {
  users: UserRepository
  eventBus: EventBus
}

export class AssignRoleUseCase {
  constructor(private readonly deps: AssignRoleUseCaseDeps) {}

  async execute(actorId: string, targetUserId: string, input: unknown): Promise<UserView> {
    const data = parseOrThrow(assignRoleSchema, input)

    const actor = await this.deps.users.findById(actorId)
    if (!actor || actor.role !== 'administrator') {
      throw new ForbiddenError('Somente administrador pode atribuir papéis')
    }

    const target = await this.deps.users.findById(targetUserId)
    if (!target) {
      throw new NotFoundError('Usuário não encontrado')
    }

    target.assignRole(data.role)
    await this.deps.users.update(target)
    await this.deps.eventBus.publish(roleAssignedEvent({ userId: target.id, role: data.role, assignedBy: actorId }))

    return toUserView(target)
  }
}
