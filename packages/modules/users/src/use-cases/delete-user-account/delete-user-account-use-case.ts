// Path: packages/modules/users/src/use-cases/delete-user-account/delete-user-account-use-case.ts
// LGPD art. 18 (eliminação): anonimiza o titular (sem PII), desativa a conta e
// revoga todas as sessões. Preserva a integridade referencial — comentários,
// decks e torneios permanecem, porém sem autoria identificável. Regra defensiva:
// o único administrador ativo não pode excluir a própria conta (evita lockout).
import type { EventBus } from '@digimon/contracts'
import { ConflictError, NotFoundError } from '@digimon/contracts'
import type { UserRepository } from '../../domain/repositories/user-repository'
import type { SessionTokenRevoker } from '../../domain/repositories/session-token-revoker'
import { userUpdatedEvent } from '../../domain/events/user-events'

export interface DeleteUserAccountUseCaseDeps {
  users: UserRepository
  refreshTokens: SessionTokenRevoker
  eventBus: EventBus
}

export class DeleteUserAccountUseCase {
  constructor(private readonly deps: DeleteUserAccountUseCaseDeps) {}

  async execute(userId: string): Promise<void> {
    const user = await this.deps.users.findById(userId)
    if (!user) {
      throw new NotFoundError('Usuário não encontrado')
    }

    if (user.role === 'administrator') {
      const { total } = await this.deps.users.list({
        role: 'administrator',
        status: 'active',
        pageSize: 1
      })
      if (total <= 1) {
        throw new ConflictError('O único administrador ativo não pode excluir a própria conta')
      }
    }

    user.anonymize()
    await this.deps.users.update(user)
    await this.deps.refreshTokens.revokeAllForUser(user.id)
    await this.deps.eventBus.publish(userUpdatedEvent(user.id))
  }
}
