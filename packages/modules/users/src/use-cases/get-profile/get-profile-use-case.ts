// Path: packages/modules/users/src/use-cases/get-profile/get-profile-use-case.ts
// Dados do perfil do usuário logado.
import { NotFoundError } from '@digimon/contracts'
import type { UserRepository } from '../../domain/repositories/user-repository'
import { toUserView } from '../user-view'
import type { UserView } from '../schemas'

export interface GetProfileUseCaseDeps {
  users: UserRepository
}

export class GetProfileUseCase {
  constructor(private readonly deps: GetProfileUseCaseDeps) {}

  async execute(userId: string): Promise<UserView> {
    const user = await this.deps.users.findById(userId)
    if (!user) {
      throw new NotFoundError('Usuário não encontrado')
    }
    return toUserView(user)
  }
}
