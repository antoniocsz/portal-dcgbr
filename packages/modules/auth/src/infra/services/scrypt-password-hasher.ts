// Path: packages/modules/auth/src/infra/services/scrypt-password-hasher.ts
// PasswordHasher com scrypt nativo do node:crypto (NIST-recomendado, sem dep externa).
// Formato armazenado: scrypt$<salt hex 16B>$<hash hex 64B>
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { PasswordHasher } from '../../domain/services/password-hasher'

const KEY_LENGTH = 64
const SALT_LENGTH = 16

export class ScryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(SALT_LENGTH)
    const derived = scryptSync(password, salt, KEY_LENGTH)
    return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`
  }

  async verify(password: string, stored: string): Promise<boolean> {
    const parts = stored.split('$')
    if (parts.length !== 3 || parts[0] !== 'scrypt') {
      return false
    }
    const [, saltHex, hashHex] = parts
    const salt = Buffer.from(saltHex ?? '', 'hex')
    const expected = Buffer.from(hashHex ?? '', 'hex')
    if (salt.length === 0 || expected.length === 0) {
      return false
    }
    const derived = scryptSync(password, salt, KEY_LENGTH)
    return timingSafeEqual(derived, expected)
  }
}
