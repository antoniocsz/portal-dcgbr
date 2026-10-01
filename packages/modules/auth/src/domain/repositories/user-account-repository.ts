// Path: packages/modules/auth/src/domain/repositories/user-account-repository.ts
// Porta de saída (DIP) para a conta de usuário que o auth precisa.
// A implementação vive no módulo @digimon/users (PrismaUserRepository) e é
// injetada pelo composition root (apps/web). Módulos não se importam
// diretamente — apenas via barrel público (regra de fronteiras).
import type { Role } from '@digimon/contracts'

export interface UserAccountRecord {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  passwordHash: string
  role: Role
  status: 'active' | 'inactive'
  emailVerifiedAt: Date | null
}

export interface CreateUserAccountInput {
  email: string
  name: string
  passwordHash: string
  role: Role
}

export interface UserAccountRepository {
  findById(id: string): Promise<UserAccountRecord | null>
  findByEmail(email: string): Promise<UserAccountRecord | null>
  create(data: CreateUserAccountInput): Promise<UserAccountRecord>
  updatePassword(id: string, passwordHash: string): Promise<void>
}
