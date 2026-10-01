// Path: packages/modules/auth/src/use-cases/refresh-token/refresh-token-use-case.spec.ts
import { describe, expect, it } from 'vitest'
import { UnauthorizedError } from '@digimon/contracts'
import { RefreshTokenUseCase } from './refresh-token-use-case'
import { FakeTokenService, InMemoryRefreshTokenRepository, InMemoryUserAccountRepository } from '../../testing/fakes'
import { RefreshToken } from '../../domain/entities/refresh-token'
import { REFRESH_TOKEN_TTL_MS } from '../../domain/constants'

function setup() {
  const users = new InMemoryUserAccountRepository()
  const refreshTokens = new InMemoryRefreshTokenRepository()
  const tokens = new FakeTokenService()
  users.seed({
    id: 'user-1',
    email: 'gabriel@example.com',
    name: 'Gabriel',
    avatarUrl: null,
    passwordHash: 'fake$hash',
    role: 'member',
    status: 'active',
    emailVerifiedAt: null
  })
  const useCase = new RefreshTokenUseCase({ users, refreshTokens, tokens })
  return { useCase, users, refreshTokens, tokens }
}

async function seedSession(refreshTokens: InMemoryRefreshTokenRepository, tokens: FakeTokenService, ttlMs = REFRESH_TOKEN_TTL_MS) {
  const refresh = tokens.issueRefreshToken()
  await refreshTokens.create(
    RefreshToken.create({
      id: 'rt-1',
      userId: 'user-1',
      tokenHash: refresh.tokenHash,
      expiresAt: new Date(Date.now() + ttlMs)
    })
  )
  return refresh.token
}

describe('RefreshTokenUseCase', () => {
  it('rotaciona: token antigo é revogado e rejeitado (critério de conclusão)', async () => {
    const { useCase, refreshTokens, tokens } = setup()
    const oldToken = await seedSession(refreshTokens, tokens)

    const first = await useCase.execute({ refreshToken: oldToken })
    expect(first.refreshToken).not.toBe(oldToken)

    // Token antigo (já revogado) rejeitado.
    await expect(useCase.execute({ refreshToken: oldToken })).rejects.toBeInstanceOf(UnauthorizedError)

    // Novo token continua válido (rotation funcionando).
    const second = await useCase.execute({ refreshToken: first.refreshToken })
    expect(second.refreshToken).not.toBe(first.refreshToken)
  })

  it('rejeita token expirado', async () => {
    const { useCase, refreshTokens, tokens } = setup()
    const oldToken = await seedSession(refreshTokens, tokens, -1000)
    await expect(useCase.execute({ refreshToken: oldToken })).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('rejeita token desconhecido', async () => {
    const { useCase } = setup()
    await expect(useCase.execute({ refreshToken: 'refresh.999' })).rejects.toBeInstanceOf(UnauthorizedError)
  })
})
