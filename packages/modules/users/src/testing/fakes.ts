// Path: packages/modules/users/src/testing/fakes.ts
// Repositório de usuários in-memory para testes unitários (LSP).
import type { PaginatedResult, Role } from '@digimon/contracts'
import type { UserRepository, ListUsersParams } from '../domain/repositories/user-repository'
import type { CreateUserData } from '../domain/entities/user'
import { User } from '../domain/entities/user'

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>()

  seed(user: User): void {
    this.users.set(user.id, user)
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user
    }
    return null
  }

  async create(data: CreateUserData): Promise<User> {
    const user = User.create(data)
    this.users.set(user.id, user)
    return user
  }

  async update(user: User): Promise<void> {
    this.users.set(user.id, user)
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const user = this.users.get(id)
    if (user) {
      user.updatePasswordHash(passwordHash)
    }
  }

  async list(params: ListUsersParams): Promise<PaginatedResult<User>> {
    let items = [...this.users.values()]
    if (params.search) {
      const q = params.search.toLowerCase()
      items = items.filter(
        (u) => u.email.toLowerCase().includes(q) || u.data.name.toLowerCase().includes(q)
      )
    }
    if (params.role) items = items.filter((u) => u.role === (params.role as Role))
    if (params.status) items = items.filter((u) => u.status === params.status)

    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20
    const start = (page - 1) * pageSize
    return {
      items: items.slice(start, start + pageSize),
      total: items.length,
      page,
      pageSize
    }
  }
}
