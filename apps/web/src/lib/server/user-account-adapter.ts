// Path: apps/web/src/lib/server/user-account-adapter.ts
// Adapter entre UserRepository (@digimon/users) e UserAccountRepository
// (porta DIP do @digimon/auth). Converte a entidade User em UserAccountRecord.
// Módulos não se importam diretamente — o composition root faz a ponte.
import type {
  CreateUserAccountInput,
  UserAccountRecord,
  UserAccountRepository
} from '@digimon/auth'
import type { UserRepository } from '@digimon/users'

export class UserAccountAdapter implements UserAccountRepository {
  constructor(private readonly users: UserRepository) {}

  async findById(id: string): Promise<UserAccountRecord | null> {
    const user = await this.users.findById(id)
    return user ? toRecord(user) : null
  }

  async findByEmail(email: string): Promise<UserAccountRecord | null> {
    const user = await this.users.findByEmail(email)
    return user ? toRecord(user) : null
  }

  async create(data: CreateUserAccountInput): Promise<UserAccountRecord> {
    const user = await this.users.create({
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
      role: data.role
    })
    return toRecord(user)
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.users.updatePassword(id, passwordHash)
  }
}

function toRecord(user: {
  id: string
  email: string
  data: {
    name: string
    avatarUrl: string | null
    passwordHash: string
    emailVerifiedAt: Date | null
  }
  role: 'administrator' | 'editor' | 'member'
  status: 'active' | 'inactive'
}): UserAccountRecord {
  return {
    id: user.id,
    email: user.email,
    name: user.data.name,
    avatarUrl: user.data.avatarUrl,
    passwordHash: user.data.passwordHash,
    role: user.role,
    status: user.status,
    emailVerifiedAt: user.data.emailVerifiedAt
  }
}
