// Path: packages/modules/auth/src/use-cases/login/login-use-case.spec.ts
import { describe, expect, it } from 'vitest'
import { UnauthorizedError } from '@digimon/contracts'
import { LoginUseCase } from './login-use-case'
import { FakePasswordHasher, FakeTokenService, InMemoryRefreshTokenRepository, InMemoryUserAccountRepository } from '../../testing/fakes'

async function setup() {
  const users = new InMemoryUserAccountRepository()
  const refreshTokens = new InMemoryRefreshTokenRepository()
  const hasher = new FakePasswordHasher()
  const passwordHash = await hasher.hash('SenhaForte123')
  users.seed({
    id: 'user-1',
    email: 'gabriel@example.com',
    name: 'Gabriel',
    avatarUrl: null,
    passwordHash,
    role: 'member',
    status: 'active',
    emailVerifiedAt: null
  })
  const useCase = new LoginUseCase({
    users,
    refreshTokens,
    passwordHasher: hasher,
    tokens: new FakeTokenService()
  })
  return { useCase, refreshTokens, hasher }
}

describe('LoginUseCase', () => {
  it('valida credenciais e emite access + refresh', async () => {
    const { useCase } = await setup()
    const session = await useCase.execute({ email: 'gabriel@example.com', password: 'SenhaForte123' })
    expect(session.accessToken).toBeTruthy()
    expect(session.refreshToken).toBeTruthy()
    expect(session.user.id).toBe('user-1')
  })

  it('rejeita senha incorreta com mensagem genérica', async () => {
    const { useCase } = await setup()
    await expect(
      useCase.execute({ email: 'gabriel@example.com', password: 'SenhaErrada123' })
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('não revela se o email existe', async () => {
    const { useCase } = await setup()
    await expect(
      useCase.execute({ email: 'naoexiste@example.com', password: 'Qualquer123' })
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })
})
