// Path: packages/modules/users/src/domain/entities/user.ts
// Aggregate raiz do módulo users. Papéis fixos e globais (ADR-004):
// administrator | editor | member. Senha nunca exposta em DTOs.
import type { Role } from '@digimon/contracts'
import { ConflictError } from '@digimon/contracts'

export type UserStatus = 'active' | 'inactive'

export interface UserData {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  passwordHash: string
  role: Role
  emailVerifiedAt: Date | null
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  id?: string
  email: string
  name: string
  avatarUrl?: string | null
  passwordHash: string
  role: Role
}

export interface UpdateUserData {
  name?: string
  avatarUrl?: string | null
}

export class User {
  private constructor(public readonly data: UserData) {}

  static create(props: CreateUserData): User {
    const now = new Date()
    return new User({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      avatarUrl: props.avatarUrl ?? null,
      emailVerifiedAt: null,
      status: 'active',
      createdAt: now,
      updatedAt: now
    })
  }

  static fromData(data: UserData): User {
    return new User(data)
  }

  get id(): string {
    return this.data.id
  }

  get email(): string {
    return this.data.email
  }

  get role(): Role {
    return this.data.role
  }

  get status(): UserStatus {
    return this.data.status
  }

  get isActive(): boolean {
    return this.data.status === 'active'
  }

  /** Atualiza nome/avatar. Não altera papel, status ou senha. */
  updateProfile(patch: UpdateUserData): void {
    if (patch.name !== undefined) this.data.name = patch.name
    if (patch.avatarUrl !== undefined) this.data.avatarUrl = patch.avatarUrl
    this.data.updatedAt = new Date()
  }

  /** Atribuição de papel — autorização validada no use case (somente administrator). */
  assignRole(role: Role): void {
    if (this.data.role === role) return
    this.data.role = role
    this.data.updatedAt = new Date()
  }

  activate(): void {
    if (this.data.status === 'active') return
    this.data.status = 'active'
    this.data.updatedAt = new Date()
  }

  deactivate(): void {
    if (this.data.status === 'inactive') return
    this.data.status = 'inactive'
    this.data.updatedAt = new Date()
  }

  /** Troca o hash da senha — usado no reset de senha (módulo auth via DIP). */
  updatePasswordHash(passwordHash: string): void {
    this.data.passwordHash = passwordHash
    this.data.updatedAt = new Date()
  }

  /** Não permite desativar o próprio administrador ativo (proteção de lockout). */
  assertNotSelfDeactivation(actorId: string): void {
    if (this.data.id === actorId && this.data.role === 'administrator' && this.data.status === 'active') {
      throw new ConflictError('Administrador não pode desativar a própria conta ativa')
    }
  }
}
