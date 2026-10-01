// Path: packages/modules/users/src/use-cases/deactivate-user/deactivate-user-use-case.ts
// Desativa conta — somente administrator. Impede o administrador de desativar
// a própria conta ativa (proteção contra lockout).
import type { EventBus } from '@digimon/contracts'
import { ForbiddenError, NotFoundError } from '@digimon/contracts'
import type { UserRepository } from '../../domain/repositories/user-repository'
import { userUpdatedEvent } from '../../domain/events/user-events'
import { toUserView } from '../user-view'
import type { UserView } from '../schemas'

export interface DeactivateUserUseCaseDeps {
  users: UserRepository
  eventBus: EventBus
}

export class DeactivateUserUseCase {
  constructor(private readonly deps: DeactivateUserUseCaseDeps) {}

  async execute(actorId: string, targetUserId: string): Promise<UserView> {
    const actor = await this.deps.users.findById(actorId)
    if (!actor || actor.role !== 'administrator') {
      throw new ForbiddenError('Somente administrador pode desativar contas')
    }

    const target = await this.deps.users.findById(targetUserId)
    if (!target) {
      throw new NotFoundError('Usuário não encontrado')
    }

    target.assertNotSelfDeactivation(actorId)
    target.deactivate()
    await this.deps.users.update(target)
    await this.deps.eventBus.publish(userUpdatedEvent(target.id))

    return toUserView(target)
  }
}
