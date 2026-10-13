// Path: packages/modules/users/src/domain/repositories/user-activity-provider.ts
// Porta (DIP) para reunir a atividade do titular nas bases de outros módulos
// (comentários, decks, torneios e publicações na comunidade) sem criar
// dependência direta entre módulos. Implementada no composition root da API.
// Expõe APENAS dados do próprio titular — nunca de terceiros.

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

export interface UserActivityProvider {
  listComments(authorId: string): Promise<UserCommentRecord[]>
  listDecks(ownerId: string): Promise<UserDeckRecord[]>
  listTournaments(organizerId: string): Promise<UserTournamentRecord[]>
  listCommunityDecks(accountId: string): Promise<UserCommunityDeckRecord[]>
}
