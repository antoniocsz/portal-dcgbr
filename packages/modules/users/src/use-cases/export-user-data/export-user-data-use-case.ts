// Path: packages/modules/users/src/use-cases/export-user-data/export-user-data-use-case.ts
// LGPD art. 18 (portabilidade): reúne em um único JSON os dados do titular —
// perfil, comentários, decks, torneios e publicações na comunidade. Sem dados de
// terceiros (cada registro pertence ao titular).
import { NotFoundError } from '@digimon/contracts'
import type { Role } from '@digimon/contracts'
import type { UserRepository } from '../../domain/repositories/user-repository'
import type {
  UserActivityProvider,
  UserCommentRecord,
  UserCommunityDeckRecord,
  UserDeckRecord,
  UserTournamentRecord
} from '../../domain/repositories/user-activity-provider'

export interface ExportUserDataUseCaseDeps {
  users: UserRepository
  activity: UserActivityProvider
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

export interface UserDataExport {
  exportedAt: Date
  user: ExportedUserProfile
  comments: UserCommentRecord[]
  decks: UserDeckRecord[]
  tournaments: UserTournamentRecord[]
  communityDecks: UserCommunityDeckRecord[]
}

export class ExportUserDataUseCase {
  constructor(private readonly deps: ExportUserDataUseCaseDeps) {}

  async execute(userId: string): Promise<UserDataExport> {
    const user = await this.deps.users.findById(userId)
    if (!user) {
      throw new NotFoundError('Usuário não encontrado')
    }

    const [comments, decks, tournaments, communityDecks] = await Promise.all([
      this.deps.activity.listComments(userId),
      this.deps.activity.listDecks(userId),
      this.deps.activity.listTournaments(userId),
      this.deps.activity.listCommunityDecks(userId)
    ])

    return {
      exportedAt: new Date(),
      user: {
        id: user.id,
        name: user.data.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatarUrl: user.data.avatarUrl,
        emailVerifiedAt: user.data.emailVerifiedAt,
        createdAt: user.data.createdAt,
        updatedAt: user.data.updatedAt
      },
      comments,
      decks,
      tournaments,
      communityDecks
    }
  }
}
