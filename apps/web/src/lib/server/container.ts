// Path: apps/web/src/lib/server/container.ts
// Composition root: monta os use cases com as implementações Prisma.
// Aplica DIP — os use cases recebem interfaces; o app escolhe as implementações.
import { InMemoryEventBus } from '@digimon/contracts'
import { prisma } from '@digimon/database'
import {
  JwtTokenService,
  PrismaPasswordResetTokenRepository,
  PrismaRefreshTokenRepository,
  ScryptPasswordHasher
} from '@digimon/auth'
import { PrismaUserRepository } from '@digimon/users'
import { UserAccountAdapter } from './user-account-adapter'

const eventBus = new InMemoryEventBus()

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET ausente ou curto demais (mínimo 32 caracteres)')
  }
  return secret
}

export function authDeps() {
  const users = new UserAccountAdapter(new PrismaUserRepository(prisma))
  const refreshTokens = new PrismaRefreshTokenRepository(prisma)
  const passwordResetTokens = new PrismaPasswordResetTokenRepository(prisma)
  const passwordHasher = new ScryptPasswordHasher()
  const tokens = new JwtTokenService(getJwtSecret())

  return { users, refreshTokens, passwordResetTokens, passwordHasher, tokens, eventBus }
}

export function usersDeps() {
  const users = new PrismaUserRepository(prisma)
  return { users, eventBus }
}

export { eventBus }
