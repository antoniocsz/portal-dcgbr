// Path: packages/modules/users/src/infra/repositories/prisma-user-repository.ts
// Implementação Prisma de UserRepository. Mapeia enums do schema (MAIÚSCULAS)
// para os tipos de domínio (minúsculas, serializáveis).
import type { Prisma, PrismaClient, Role as PrismaRole, UserStatus as PrismaUserStatus } from '@digimon/database'
import type { Role } from '@digimon/contracts'
import type { UserRepository, ListUsersParams } from '../../domain/repositories/user-repository'
import type { CreateUserData } from '../../domain/entities/user'
import { User } from '../../domain/entities/user'
import type { UserStatus } from '../../domain/entities/user'
import type { PaginatedResult } from '@digimon/contracts'

const ROLE_TO_PRISMA: Record<Role, PrismaRole> = {
  administrator: 'ADMINISTRATOR',
  editor: 'EDITOR',
  member: 'MEMBER'
}

const PRISMA_TO_ROLE: Record<PrismaRole, Role> = {
  ADMINISTRATOR: 'administrator',
  EDITOR: 'editor',
  MEMBER: 'member'
}

const STATUS_TO_PRISMA: Record<UserStatus, PrismaUserStatus> = {
  active: 'ACTIVE',
  inactive: 'INACTIVE'
}

const PRISMA_TO_STATUS: Record<PrismaUserStatus, UserStatus> = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } })
    return row ? this.toDomain(row) : null
  }

  async create(data: CreateUserData): Promise<User> {
    const user = User.create(data)
    const row = await this.prisma.user.create({
      data: {
        id: user.data.id,
        email: user.data.email,
        name: user.data.name,
        avatarUrl: user.data.avatarUrl,
        passwordHash: user.data.passwordHash,
        role: ROLE_TO_PRISMA[user.data.role],
        emailVerifiedAt: user.data.emailVerifiedAt,
        status: STATUS_TO_PRISMA[user.data.status]
      }
    })
    return this.toDomain(row)
  }

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.data.name,
        avatarUrl: user.data.avatarUrl,
        role: ROLE_TO_PRISMA[user.data.role],
        status: STATUS_TO_PRISMA[user.data.status],
        passwordHash: user.data.passwordHash,
        emailVerifiedAt: user.data.emailVerifiedAt
      }
    })
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { passwordHash } })
  }

  async list(params: ListUsersParams): Promise<PaginatedResult<User>> {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20

    const where: Prisma.UserWhereInput = {}
    if (params.search) {
      where.OR = [
        { email: { contains: params.search, mode: 'insensitive' } },
        { name: { contains: params.search, mode: 'insensitive' } }
      ]
    }
    if (params.role) where.role = ROLE_TO_PRISMA[params.role]
    if (params.status) where.status = STATUS_TO_PRISMA[params.status]

    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.prisma.user.count({ where })
    ])

    return {
      items: rows.map((row) => this.toDomain(row)),
      total,
      page,
      pageSize
    }
  }

  private toDomain(row: {
    id: string
    email: string
    name: string
    avatarUrl: string | null
    passwordHash: string
    role: PrismaRole
    emailVerifiedAt: Date | null
    status: PrismaUserStatus
    createdAt: Date
    updatedAt: Date
  }): User {
    return User.fromData({
      id: row.id,
      email: row.email,
      name: row.name,
      avatarUrl: row.avatarUrl,
      passwordHash: row.passwordHash,
      role: PRISMA_TO_ROLE[row.role] ?? 'member',
      emailVerifiedAt: row.emailVerifiedAt,
      status: PRISMA_TO_STATUS[row.status] ?? 'active',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    })
  }
}
