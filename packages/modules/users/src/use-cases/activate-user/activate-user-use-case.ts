// Path: packages/modules/users/src/use-cases/activate-user/activate-user-use-case.ts
// Ativa conta — somente administrator.
import type { EventBus } from '@digimon/contracts'
import { ForbiddenError, NotFoundError } from '@digimon/contracts'
import type { UserRepository } from '../../domain/repositories/user-repository'
import { userUpdatedEvent } from '../../domain/events/user-events'
import { toUserView } from '../user-view'
import type { UserView } from '../schemas'

export interface ActivateUserUseCaseDeps {
  users: UserRepository
  eventBus: EventBus
}

export class ActivateUserUseCase {
  constructor(private readonly deps: ActivateUserUseCaseDeps) {}

  async execute(actorId: string, targetUserId: string): Promise<UserView> {
    const actor = await this.deps.users.findById(actorId)
    if (!actor || actor.role !== 'administrator') {
      throw new ForbiddenError('Somente administrador pode ativar contas')
    }

    const target = await this.deps.users.findById(targetUserId)
    if (!target) {
      throw new NotFoundError('Usuário não encontrado')
    }

    target.activate()
    await this.deps.users.update(target)
    await this.deps.eventBus.publish(userUpdatedEvent(target.id))

    return toUserView(target)
  }
}
