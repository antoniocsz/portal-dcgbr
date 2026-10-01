// Path: packages/modules/users/src/use-cases/assign-role/assign-role-use-case.spec.ts
import { describe, expect, it } from 'vitest'
import { InMemoryEventBus } from '@digimon/contracts'
import { ForbiddenError, NotFoundError } from '@digimon/contracts'
import { AssignRoleUseCase } from './assign-role-use-case'
import { InMemoryUserRepository } from '../../testing/fakes'
import { User } from '../../domain/entities/user'

function seedAdmin(repo: InMemoryUserRepository) {
  repo.seed(
    User.create({
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash: 'hash',
      role: 'administrator'
    })
  )
}

function seedEditor(repo: InMemoryUserRepository) {
  repo.seed(
    User.create({
      id: 'editor-1',
      email: 'editor@example.com',
      name: 'Editor',
      passwordHash: 'hash',
      role: 'editor'
    })
  )
}

describe('AssignRoleUseCase', () => {
  it('somente administrator atribui papel (critério de conclusão)', async () => {
    const repo = new InMemoryUserRepository()
    seedAdmin(repo)
    seedEditor(repo)
    const eventBus = new InMemoryEventBus()
    const events: string[] = []
    eventBus.subscribe('role.assigned', (event) => {
      events.push(event.type)
    })

    const useCase = new AssignRoleUseCase({ users: repo, eventBus })
    const result = await useCase.execute('admin-1', 'editor-1', { role: 'member' })

    expect(result.role).toBe('member')
    expect(events).toEqual(['role.assigned'])
  })

  it('bloqueia editor/member com ForbiddenError', async () => {
    const repo = new InMemoryUserRepository()
    seedAdmin(repo)
    seedEditor(repo)
    const useCase = new AssignRoleUseCase({ users: repo, eventBus: new InMemoryEventBus() })

    await expect(useCase.execute('editor-1', 'admin-1', { role: 'member' })).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('NotFoundError para alvo inexistente', async () => {
    const repo = new InMemoryUserRepository()
    seedAdmin(repo)
    const useCase = new AssignRoleUseCase({ users: repo, eventBus: new InMemoryEventBus() })

    await expect(useCase.execute('admin-1', 'ghost', { role: 'editor' })).rejects.toBeInstanceOf(NotFoundError)
  })
})
