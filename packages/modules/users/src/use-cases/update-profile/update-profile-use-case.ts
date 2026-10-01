// Path: packages/modules/users/src/use-cases/update-profile/update-profile-use-case.ts
// Atualiza nome/avatar do próprio perfil (usuário logado edita a si mesmo).
import type { EventBus } from '@digimon/contracts'
import { NotFoundError } from '@digimon/contracts'
import type { UserRepository } from '../../domain/repositories/user-repository'
import { userUpdatedEvent } from '../../domain/events/user-events'
import { toUserView } from '../user-view'
import { updateProfileSchema, type UserView } from '../schemas'
import { parseOrThrow } from '../parse-or-throw'

export interface UpdateProfileUseCaseDeps {
  users: UserRepository
  eventBus: EventBus
}

export class UpdateProfileUseCase {
  constructor(private readonly deps: UpdateProfileUseCaseDeps) {}

  async execute(userId: string, input: unknown): Promise<UserView> {
    const data = parseOrThrow(updateProfileSchema, input)

    const user = await this.deps.users.findById(userId)
    if (!user) {
      throw new NotFoundError('Usuário não encontrado')
    }

    const patch: { name?: string; avatarUrl?: string | null } = {}
    if (data.name !== undefined) patch.name = data.name
    if (data.avatarUrl !== undefined) patch.avatarUrl = data.avatarUrl

    user.updateProfile(patch)
    await this.deps.users.update(user)
    await this.deps.eventBus.publish(userUpdatedEvent(user.id))

    return toUserView(user)
  }
}
