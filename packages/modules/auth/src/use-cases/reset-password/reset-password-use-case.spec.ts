// Path: packages/modules/auth/src/use-cases/reset-password/reset-password-use-case.spec.ts
import { describe, expect, it } from 'vitest'
import { InMemoryEventBus } from '@digimon/contracts'
import { ValidationError } from '@digimon/contracts'
import { ResetPasswordUseCase } from './reset-password-use-case'
import {
  FakePasswordHasher,
  FakeTokenService,
  InMemoryPasswordResetTokenRepository,
  InMemoryRefreshTokenRepository,
  InMemoryUserAccountRepository
} from '../../testing/fakes'
import { PasswordResetToken } from '../../domain/entities/password-reset-token'
import { RefreshToken } from '../../domain/entities/refresh-token'
import { PASSWORD_RESET_TOKEN_TTL_MS } from '../../domain/constants'

function setup() {
  const users = new InMemoryUserAccountRepository()
  const passwordResetTokens = new InMemoryPasswordResetTokenRepository()
  const refreshTokens = new InMemoryRefreshTokenRepository()
  const tokens = new FakeTokenService()
  const eventBus = new InMemoryEventBus()
  const events: string[] = []
  eventBus.subscribe('password.reset', (event) => {
    events.push(event.type)
  })

  users.seed({
    id: 'user-1',
    email: 'gabriel@example.com',
    name: 'Gabriel',
    avatarUrl: null,
    passwordHash: 'fake$old',
    role: 'member',
    status: 'active',
    emailVerifiedAt: null
  })

  const useCase = new ResetPasswordUseCase({
    users,
    passwordResetTokens,
    refreshTokens,
    passwordHasher: new FakePasswordHasher(),
    tokens,
    eventBus
  })
  return { useCase, users, passwordResetTokens, refreshTokens, tokens, events }
}

async function seedResetToken(repo: InMemoryPasswordResetTokenRepository, tokens: FakeTokenService, ttlMs = PASSWORD_RESET_TOKEN_TTL_MS, used = false) {
  const issued = tokens.issueRefreshToken()
  const token = PasswordResetToken.create({
    id: 'reset-1',
    userId: 'user-1',
    tokenHash: issued.tokenHash,
    expiresAt: new Date(Date.now() + ttlMs)
  })
  await repo.create(token)
  if (used) await repo.markUsed(token.id)
  return issued.token
}

describe('ResetPasswordUseCase', () => {
  it('troca o hash, revoga refresh tokens e publica password.reset', async () => {
    const { useCase, users, passwordResetTokens, refreshTokens, tokens, events } = setup()
    const resetToken = await seedResetToken(passwordResetTokens, tokens)

    // Refresh token ativo antes do reset — deve ser revogado pelo reset.
    const seeded = tokens.issueRefreshToken()
    await refreshTokens.create(
      RefreshToken.create({
        id: 'rt-old',
        userId: 'user-1',
        tokenHash: seeded.tokenHash,
        expiresAt: new Date(Date.now() + 100000)
      })
    )

    const result = await useCase.execute({ token: resetToken, password: 'NovaSenha123' })
    expect(result).toEqual({ ok: true })

    const user = await users.findById('user-1')
    expect(user?.passwordHash).not.toBe('fake$old')
    expect(user?.passwordHash).toBe(await new FakePasswordHasher().hash('NovaSenha123'))

    // Todos os refresh tokens do usuário foram revogados.
    const after = await refreshTokens.findByTokenHash(seeded.tokenHash)
    expect(after?.isRevoked).toBe(true)

    expect(events).toEqual(['password.reset'])
  })

  it('rejeita token expirado (critério de conclusão)', async () => {
    const { useCase, passwordResetTokens, tokens } = setup()
    const resetToken = await seedResetToken(passwordResetTokens, tokens, -1000)
    await expect(
      useCase.execute({ token: resetToken, password: 'NovaSenha123' })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejeita token reutilizado — single-use (critério de conclusão)', async () => {
    const { useCase, passwordResetTokens, tokens } = setup()
    const resetToken = await seedResetToken(passwordResetTokens, tokens, PASSWORD_RESET_TOKEN_TTL_MS, true)
    await expect(
      useCase.execute({ token: resetToken, password: 'NovaSenha123' })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejeita token desconhecido', async () => {
    const { useCase } = setup()
    await expect(
      useCase.execute({ token: 'desconhecido', password: 'NovaSenha123' })
    ).rejects.toBeInstanceOf(ValidationError)
  })
})
