// Path: packages/modules/auth/src/infra/services/jwt-token-service.ts
// TokenService com JWT HS256 próprio (node:crypto — sem lib externa, ADR-002).
// Access token: payload { sub, role, iat, exp } TTL 15min.
// Refresh token: aleatório (32B base64url); persistido apenas como hash SHA-256.
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { UnauthorizedError } from '@digimon/contracts'
import type { Role } from '@digimon/contracts'
import type { AccessTokenPayload, IssuedRefreshToken, TokenService } from '../../domain/services/token-service'
import { ACCESS_TOKEN_TTL_MS } from '../../domain/constants'

interface JwtHeader {
  alg: 'HS256'
  typ: 'JWT'
}

interface JwtPayload {
  sub: string
  role: Role
  iat: number
  exp: number
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url')
}

export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly accessTtlMs: number = ACCESS_TOKEN_TTL_MS
  ) {
    if (!secret || secret.length < 32) {
      throw new Error('JWT secret deve ter ao menos 32 caracteres')
    }
  }

  signAccessToken(userId: string, role: Role): string {
    const now = Date.now()
    const header: JwtHeader = { alg: 'HS256', typ: 'JWT' }
    const payload: JwtPayload = {
      sub: userId,
      role,
      iat: Math.floor(now / 1000),
      exp: Math.floor((now + this.accessTtlMs) / 1000)
    }
    const encodedHeader = base64url(JSON.stringify(header))
    const encodedPayload = base64url(JSON.stringify(payload))
    const signature = this.sign(`${encodedHeader}.${encodedPayload}`)
    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new UnauthorizedError('Token inválido')
    }
    const [encodedHeader, encodedPayload, signature] = parts
    const expected = this.sign(`${encodedHeader}.${encodedPayload}`)
    const provided = Buffer.from(signature ?? '', 'base64url')
    const expectedBuffer = Buffer.from(expected, 'base64url')
    if (provided.length !== expectedBuffer.length || !timingSafeEqual(provided, expectedBuffer)) {
      throw new UnauthorizedError('Token inválido')
    }

    let payload: JwtPayload
    try {
      payload = JSON.parse(Buffer.from(encodedPayload ?? '', 'base64url').toString('utf8')) as JwtPayload
    } catch {
      throw new UnauthorizedError('Token inválido')
    }

    if (typeof payload.sub !== 'string' || !['administrator', 'editor', 'member'].includes(payload.role)) {
      throw new UnauthorizedError('Token inválido')
    }
    if (payload.exp * 1000 <= Date.now()) {
      throw new UnauthorizedError('Token expirado')
    }

    return { userId: payload.sub, role: payload.role }
  }

  issueRefreshToken(): IssuedRefreshToken {
    const token = randomBytes(32).toString('base64url')
    return { token, tokenHash: this.hashToken(token) }
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  private sign(data: string): string {
    return createHmac('sha256', this.secret).update(data).digest('base64url')
  }
}
