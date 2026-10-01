// Path: packages/modules/auth/src/infra/http/verify-jwt.spec.ts
import { describe, expect, it } from 'vitest'
import { ForbiddenError, UnauthorizedError } from '@digimon/contracts'
import { JwtTokenService } from '../services/jwt-token-service'
import { extractBearerToken, requireRole, verifyJwt } from './verify-jwt'

const tokens = new JwtTokenService('secret-com-pelo-menos-32-caracteres-para-teste')

describe('verifyJwt', () => {
  it('injeta userId e role para token válido (critério de conclusão)', () => {
    const token = tokens.signAccessToken('user-1', 'administrator')
    const ctx = verifyJwt(tokens, token)
    expect(ctx).toEqual({ userId: 'user-1', role: 'administrator' })
  })

  it('lança UnauthorizedError para token ausente', () => {
    expect(() => verifyJwt(tokens, null)).toThrow(UnauthorizedError)
  })

  it('lança UnauthorizedError para token inválido', () => {
    expect(() => verifyJwt(tokens, 'abc.def.ghi')).toThrow(UnauthorizedError)
  })

  it('lança UnauthorizedError para token expirado', () => {
    const expired = new JwtTokenService('outro-secret-com-pelo-menos-32-caracteres', -1000)
    const token = expired.signAccessToken('user-1', 'member')
    expect(() => verifyJwt(expired, token)).toThrow(UnauthorizedError)
  })

  it('extrai Bearer token do header Authorization', () => {
    expect(extractBearerToken('Bearer meu.token.aqui')).toBe('meu.token.aqui')
    expect(extractBearerToken(null)).toBeNull()
    expect(extractBearerToken('Basic abc')).toBeNull()
  })

  it('requireRole libera papel permitido e bloqueia os demais', () => {
    const admin = { userId: '1', role: 'administrator' as const }
    const member = { userId: '2', role: 'member' as const }
    expect(() => requireRole(admin, 'administrator')).not.toThrow()
    expect(() => requireRole(member, 'administrator')).toThrow(ForbiddenError)
  })
})
