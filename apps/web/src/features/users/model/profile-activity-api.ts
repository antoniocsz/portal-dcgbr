// Path: apps/web/src/features/users/model/profile-activity-api.ts
// Model — reúne a atividade do titular para o perfil (decks, torneios,
// comentários e publicações na comunidade), reaproveitando os repositories
// existentes. Sem hooks, sem JSX (MVVM estrito).
import { listMyComments } from '@/features/comments/model/comments-api'
import { communityDecksApi } from '@/features/decks/model/community-api'
import { decksApi } from '@/features/decks/model/decks-api'
import { tournamentsApi } from '@/features/tournaments/model/tournaments-api'
import type { ProfileActivity } from './types'

/** Tamanho de página do resumo do perfil (o titular raramente passa disso). */
const ACTIVITY_PAGE_SIZE = 100

export async function fetchProfileActivity(): Promise<ProfileActivity> {
  const [decks, tournaments, comments, publications] = await Promise.all([
    decksApi.listDecks({ mine: true, pageSize: ACTIVITY_PAGE_SIZE }),
    tournamentsApi.listTournaments({ mine: true, pageSize: ACTIVITY_PAGE_SIZE }),
    listMyComments({ pageSize: ACTIVITY_PAGE_SIZE }),
    communityDecksApi.listPublications()
  ])

  return {
    stats: {
      decks: decks.total,
      tournaments: tournaments.total,
      comments: comments.total,
      publications: publications.length
    },
    decks: decks.items,
    tournaments: tournaments.items,
    comments: comments.items,
    publications
  }
}
