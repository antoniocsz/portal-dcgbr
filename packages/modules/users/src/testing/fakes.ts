// Path: packages/modules/users/src/testing/fakes.ts
// Fakes in-memory para testes unitários (LSP): repositório de usuários, provedor
// de atividade do titular e revogador de sessões.
import type { PaginatedResult, Role } from '@digimon/contracts'
import type { UserRepository, ListUsersParams } from '../domain/repositories/user-repository'
import type {
  UserActivityProvider,
  UserCommentRecord,
  UserCommunityDeckRecord,
  UserDeckRecord,
  UserTournamentRecord
} from '../domain/repositories/user-activity-provider'
import type { SessionTokenRevoker } from '../domain/repositories/session-token-revoker'
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

/** Provedor de atividade in-memory — dados por usuário (chave = userId). */
export class InMemoryUserActivityProvider implements UserActivityProvider {
  comments = new Map<string, UserCommentRecord[]>()
  decks = new Map<string, UserDeckRecord[]>()
  tournaments = new Map<string, UserTournamentRecord[]>()
  communityDecks = new Map<string, UserCommunityDeckRecord[]>()

  async listComments(authorId: string): Promise<UserCommentRecord[]> {
    return this.comments.get(authorId) ?? []
  }

  async listDecks(ownerId: string): Promise<UserDeckRecord[]> {
    return this.decks.get(ownerId) ?? []
  }

  async listTournaments(organizerId: string): Promise<UserTournamentRecord[]> {
    return this.tournaments.get(organizerId) ?? []
  }

  async listCommunityDecks(accountId: string): Promise<UserCommunityDeckRecord[]> {
    return this.communityDecks.get(accountId) ?? []
  }
}

/** Revogador de sessões in-memory — registra quem teve tokens revogados. */
export class InMemorySessionTokenRevoker implements SessionTokenRevoker {
  readonly revoked: string[] = []

  async revokeAllForUser(userId: string): Promise<void> {
    this.revoked.push(userId)
  }
}
