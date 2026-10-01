// Path: packages/modules/auth/src/use-cases/register/register-use-case.spec.ts
import { describe, expect, it } from 'vitest'
import { InMemoryEventBus } from '@digimon/contracts'
import { ConflictError, ValidationError } from '@digimon/contracts'
import { RegisterUseCase } from './register-use-case'
import { FakePasswordHasher, FakeTokenService, InMemoryRefreshTokenRepository, InMemoryUserAccountRepository } from '../../testing/fakes'

function setup() {
  const users = new InMemoryUserAccountRepository()
  const refreshTokens = new InMemoryRefreshTokenRepository()
  const eventBus = new InMemoryEventBus()
  const events: string[] = []
  eventBus.subscribe('user.created', (event) => {
    events.push(event.type)
  })
  const useCase = new RegisterUseCase({
    users,
    refreshTokens,
    passwordHasher: new FakePasswordHasher(),
    tokens: new FakeTokenService(),
    eventBus
  })
  return { useCase, users, refreshTokens, events }
}

describe('RegisterUseCase', () => {
  it('cria conta com papel padrão member e publica user.created', async () => {
    const { useCase, events } = setup()
    const session = await useCase.execute({
      email: 'gabriel@example.com',
      name: 'Gabriel',
      password: 'SenhaForte123'
    })

    expect(session.user.email).toBe('gabriel@example.com')
    expect(session.user.role).toBe('member')
    expect(session.refreshToken).toBeTruthy()
    expect(events).toEqual(['user.created'])
  })

  it('rejeita senha fraca via Zod (critério de conclusão)', async () => {
    const { useCase } = setup()
    await expect(
      useCase.execute({ email: 'a@b.com', name: 'Ana', password: 'fraca' })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejeita email já cadastrado', async () => {
    const { useCase } = setup()
    await useCase.execute({ email: 'gabriel@example.com', name: 'Gabriel', password: 'SenhaForte123' })
    await expect(
      useCase.execute({ email: 'gabriel@example.com', name: 'Outro', password: 'SenhaForte123' })
    ).rejects.toBeInstanceOf(ConflictError)
  })
})
