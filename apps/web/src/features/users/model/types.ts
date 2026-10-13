// Path: apps/web/src/features/users/model/types.ts
// Tipos do domínio de users consumidos pela UI (espelham os DTOs dos módulos).
import type { CommentDTO } from '@/features/comments/model/comments-api'
import type { CommunityPublication } from '@/features/decks/model/community-types'
import type { DeckSummary } from '@/features/decks/model/types'
import type { TournamentSummary } from '@/features/tournaments/model/types'
import type { PaginatedResult, Role } from '@digimon/contracts'

export interface UserView {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  role: Role
  status: 'active' | 'inactive'
  emailVerifiedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface ExportedUserProfile {
  id: string
  name: string
  email: string
  role: Role
  status: 'active' | 'inactive'
  avatarUrl: string | null
  emailVerifiedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface UserCommentRecord {
  id: string
  targetType: string
  targetId: string
  body: string
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface UserDeckRecord {
  id: string
  slug: string
  name: string
  description: string | null
  format: string
  status: string
  isPublic: boolean
  cardList: unknown
  eggList: unknown
  createdAt: Date
  updatedAt: Date
}

export interface UserTournamentRecord {
  id: string
  slug: string
  name: string
  format: string
  location: string
  dateStart: Date
  dateEnd: Date | null
  status: string
  createdAt: Date
}

export interface UserCommunityDeckRecord {
  id: string
  name: string
  status: string
  likeCount: number
  copyCount: number
  publishedAt: Date
}

export interface UserDataExport {
  exportedAt: Date
  user: ExportedUserProfile
  comments: UserCommentRecord[]
  decks: UserDeckRecord[]
  tournaments: UserTournamentRecord[]
  communityDecks: UserCommunityDeckRecord[]
}

export type { Role }

export interface UpdateProfileForm {
  name: string
  avatarUrl: string
}

export interface AssignRoleForm {
  role: Role
}

export type ListUsersResult = PaginatedResult<UserView>

export interface UserListQuery {
  search?: string
  role?: Role
  status?: 'active' | 'inactive'
  page?: number
  pageSize?: number
}

/** Contadores do perfil — somatórios da atividade do titular. */
export interface ProfileActivityStats {
  decks: number
  tournaments: number
  comments: number
  publications: number
}

/** Atividade do titular exibida no perfil (métricas + abas). */
export interface ProfileActivity {
  stats: ProfileActivityStats
  decks: DeckSummary[]
  tournaments: TournamentSummary[]
  comments: CommentDTO[]
  publications: CommunityPublication[]
}
