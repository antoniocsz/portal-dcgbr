// Path: packages/modules/tournaments/src/domain/entities/tournament.ts
// Aggregate raiz do módulo tournaments. Colaborativo: Member publica torneios
// direto (status inicial `published`, sem workflow de revisão).
import { ConflictError } from '@digimon/contracts'

export type TournamentStatus = 'published' | 'cancelled' | 'finished'

export interface TournamentResultEntry {
  position: number
  player: string
  deck?: string | null
  record?: string | null
}

export interface TournamentData {
  id: string
  slug: string
  name: string
  organizerId: string
  description: string | null
  format: string
  location: string
  dateStart: Date
  dateEnd: Date | null
  status: TournamentStatus
  results: TournamentResultEntry[] | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateTournamentData {
  id: string
  slug: string
  name: string
  organizerId: string
  description: string | null
  format: string
  location: string
  dateStart: Date
  dateEnd: Date | null
}

export interface UpdateTournamentData {
  slug?: string
  name?: string
  description?: string | null
  format?: string
  location?: string
  dateStart?: Date
  dateEnd?: Date | null
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export class Tournament {
  private constructor(public readonly data: TournamentData) {}

  static create(props: CreateTournamentData): Tournament {
    const now = new Date()
    return new Tournament({
      ...props,
      status: 'published',
      results: null,
      createdAt: now,
      updatedAt: now
    })
  }

  static fromData(data: TournamentData): Tournament {
    return new Tournament(data)
  }

  get id(): string {
    return this.data.id
  }

  get slug(): string {
    return this.data.slug
  }

  get status(): TournamentStatus {
    return this.data.status
  }

  get organizerId(): string {
    return this.data.organizerId
  }

  /** Visível publicamente: published ou finished (cancelled é oculto ao público). */
  get isPublic(): boolean {
    return this.data.status === 'published' || this.data.status === 'finished'
  }

  /** Edita dados do torneio. Cancelados não são editáveis. */
  update(patch: UpdateTournamentData): void {
    if (this.data.status === 'cancelled') {
      throw new ConflictError('Torneios cancelados não podem ser editados')
    }
    if (patch.slug !== undefined) this.data.slug = patch.slug
    if (patch.name !== undefined) this.data.name = patch.name
    if (patch.description !== undefined) this.data.description = patch.description
    if (patch.format !== undefined) this.data.format = patch.format
    if (patch.location !== undefined) this.data.location = patch.location
    if (patch.dateStart !== undefined) this.data.dateStart = patch.dateStart
    if (patch.dateEnd !== undefined) this.data.dateEnd = patch.dateEnd
    this.data.updatedAt = new Date()
  }

  /** Cancela o torneio. Cancelados não podem ser recancelados nem finalizados. */
  cancel(): void {
    if (this.data.status === 'cancelled') {
      throw new ConflictError('Torneio já está cancelado')
    }
    if (this.data.status === 'finished') {
      throw new ConflictError('Torneio finalizado não pode ser cancelado')
    }
    this.data.status = 'cancelled'
    this.data.updatedAt = new Date()
  }

  /** Registra resultados e finaliza o torneio (published → finished). */
  addResults(results: TournamentResultEntry[]): void {
    if (this.data.status === 'cancelled') {
      throw new ConflictError('Torneios cancelados não recebem resultados')
    }
    this.data.results = results
    this.data.status = 'finished'
    this.data.updatedAt = new Date()
  }
}
