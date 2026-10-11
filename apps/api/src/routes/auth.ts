// Path: apps/api/src/routes/auth.ts
// Rotas de autenticação em Fastify — porte dos route handlers de
// apps/web/src/app/api/auth/** (strangler, ADR-007). Contratos JSON idênticos;
// cookie httpOnly via helpers da camada HTTP; erros via AppError (handler global).
import type { FastifyPluginAsync } from 'fastify'
import {
  ForgotPasswordUseCase,
  LoginUseCase,
  LogoutUseCase,
  RefreshTokenUseCase,
  RegisterUseCase,
  ResetPasswordUseCase,
  verifyJwt
} from '@digimon/auth'
import { GetProfileUseCase } from '@digimon/users'
import type { Role } from '@digimon/contracts'
import { authDeps, usersDeps } from '../container'
import {
  attachSessionCookies,
  clearSessionCookies,
  readAccessToken,
  readRefreshToken
} from '../http/cookies'
import { registerRateLimit } from '../plugins/rate-limit'

export interface MeResponse {
  user: {
    id: string
    role: Role
    name: string
    email: string
  } | null
}

export const authRoutes: FastifyPluginAsync = async (app) => {
  // POST /auth/login — autentica e anexa os cookies de sessão.
  app.post('/auth/login', async (request, reply) => {
    const session = await new LoginUseCase(authDeps()).execute(request.body)
    attachSessionCookies(reply, session.accessToken, session.refreshToken)
    return reply.send({ user: session.user })
  })

  // POST /auth/register — cria conta (rate limit 5 req/15min por IP).
  app.post('/auth/register', { preHandler: registerRateLimit }, async (request, reply) => {
    const session = await new RegisterUseCase(authDeps()).execute(request.body)
    attachSessionCookies(reply, session.accessToken, session.refreshToken)
    return reply.status(201).send({ user: session.user })
  })

  // POST /auth/refresh — rotation a partir do refresh token em cookie.
  app.post('/auth/refresh', async (request, reply) => {
    const refreshToken = readRefreshToken(request)
    const session = await new RefreshTokenUseCase(authDeps()).execute({ refreshToken: refreshToken ?? '' })
    attachSessionCookies(reply, session.accessToken, session.refreshToken)
    return reply.send({ user: session.user })
  })

  // POST /auth/logout — revoga o refresh token e limpa os cookies.
  app.post('/auth/logout', async (request, reply) => {
    const refreshToken = readRefreshToken(request)
    await new LogoutUseCase(authDeps()).execute({ refreshToken: refreshToken ?? '' })
    clearSessionCookies(reply)
    return reply.send({ ok: true })
  })

  // POST /auth/forgot-password — resposta genérica (não revela se o email existe).
  app.post('/auth/forgot-password', async (request, reply) => {
    await new ForgotPasswordUseCase(authDeps()).execute(request.body)
    return reply.send({ ok: true })
  })

  // POST /auth/reset-password — valida token single-use e troca a senha.
  app.post('/auth/reset-password', async (request, reply) => {
    await new ResetPasswordUseCase(authDeps()).execute(request.body)
    return reply.send({ ok: true })
  })

  // GET /auth/me — sessão atual ou { user: null }; não exige autenticação.
  app.get('/auth/me', async (request, reply) => {
    const token = readAccessToken(request)
    if (!token) {
      return reply.send({ user: null } satisfies MeResponse)
    }
    try {
      const context = verifyJwt(authDeps().tokens, token)
      const profile = await new GetProfileUseCase(usersDeps()).execute(context.userId)
      return reply.send({
        user: {
          id: context.userId,
          role: context.role,
          name: profile.name,
          email: profile.email
        }
      } satisfies MeResponse)
    } catch {
      // Token inválido/expirado ou usuário removido — trata como deslogado.
      return reply.send({ user: null } satisfies MeResponse)
    }
  })
}
