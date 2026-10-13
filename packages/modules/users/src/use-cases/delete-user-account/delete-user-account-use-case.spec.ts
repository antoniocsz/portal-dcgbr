// Path: .../delete-user-account/delete-user-account-use-case.spec.ts
import { describe, expect, it } from 'vitest'
import { ConflictError, InMemoryEventBus, NotFoundError } from '@digimon/contracts'
import { DeleteUserAccountUseCase } from './delete-user-account-use-case'
import { InMemorySessionTokenRevoker, InMemoryUserRepository } from '../../testing/fakes'
import { User } from '../../domain/entities/user'

function seedUser(repo: InMemoryUserRepository, input: { id: string; role: 'administrator' | 'editor' | 'member' }): User {
  const user = User.create({
    id: input.id,
    email: `${input.id}@example.com`,
    name: input.id,
    passwordHash: 'hash',
    role: input.role
  })
  repo.seed(user)
  return user
}

describe('DeleteUserAccountUseCase', () => {
  it('anonimiza + desativa o titular e revoga as sessões', async () => {
    const repo = new InMemoryUserRepository()
    seedUser(repo, { id: 'member-1', role: 'member' })
    const revoker = new InMemorySessionTokenRevoker()
    const events: string[] = []
    const eventBus = new InMemoryEventBus()
    eventBus.subscribe('user.updated', (event) => {
      events.push(event.type)
    })

    const useCase = new DeleteUserAccountUseCase({ users: repo, refreshTokens: revoker, eventBus })
    await useCase.execute('member-1')

    const stored = await repo.findById('member-1')
    expect(stored?.email).toBe('deleted+member-1@invalid.local')
    expect(stored?.data.name).toBe('Usuário removido')
    expect(stored?.data.avatarUrl).toBeNull()
    expect(stored?.status).toBe('inactive')
    expect(revoker.revoked).toEqual(['member-1'])
    expect(events).toEqual(['user.updated'])
  })

  it('bloqueia a exclusão do único administrador ativo (proteção de lockout)', async () => {
    const repo = new InMemoryUserRepository()
    seedUser(repo, { id: 'admin-1', role: 'administrator' })
    const useCase = new DeleteUserAccountUseCase({
      users: repo,
      refreshTokens: new InMemorySessionTokenRevoker(),
      eventBus: new InMemoryEventBus()
    })

    await expect(useCase.execute('admin-1')).rejects.toBeInstanceOf(ConflictError)
    const stored = await repo.findById('admin-1')
    expect(stored?.status).toBe('active')
  })

  it('permite ao administrador sair quando há outro admin ativo', async () => {
    const repo = new InMemoryUserRepository()
    seedUser(repo, { id: 'admin-1', role: 'administrator' })
    seedUser(repo, { id: 'admin-2', role: 'administrator' })
    const useCase = new DeleteUserAccountUseCase({
      users: repo,
      refreshTokens: new InMemorySessionTokenRevoker(),
      eventBus: new InMemoryEventBus()
    })

    await expect(useCase.execute('admin-1')).resolves.toBeUndefined()
    expect((await repo.findById('admin-1'))?.status).toBe('inactive')
  })

  it('NotFoundError para titular inexistente', async () => {
    const useCase = new DeleteUserAccountUseCase({
      users: new InMemoryUserRepository(),
      refreshTokens: new InMemorySessionTokenRevoker(),
      eventBus: new InMemoryEventBus()
    })

    await expect(useCase.execute('ghost')).rejects.toBeInstanceOf(NotFoundError)
  })
})
