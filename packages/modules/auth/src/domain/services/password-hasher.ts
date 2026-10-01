// Path: packages/modules/auth/src/domain/services/password-hasher.ts
// Hash de senha (bcrypt/argon2/scrypt) — senha nunca em claro (regra do módulo).
export interface PasswordHasher {
  hash(password: string): Promise<string>
  verify(password: string, hash: string): Promise<boolean>
}
