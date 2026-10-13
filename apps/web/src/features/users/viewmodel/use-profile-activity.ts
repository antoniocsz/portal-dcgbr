// Path: apps/web/src/features/users/viewmodel/use-profile-activity.ts
'use client'

// ViewModel — carrega a atividade do titular (decks, torneios, comentários e
// publicações) e expõe os dados prontos para as métricas e abas do perfil.
import { useEffect, useState } from 'react'
import type { CommentDTO } from '@/features/comments/model/comments-api'
import type { CommunityPublication } from '@/features/decks/model/community-types'
import type { DeckSummary } from '@/features/decks/model/types'
import type { TournamentSummary } from '@/features/tournaments/model/types'
import { fetchProfileActivity } from '../model/profile-activity-api'
import type { ProfileActivityStats } from '../model/types'

export interface ProfileActivityViewModel {
  stats: ProfileActivityStats
  decks: DeckSummary[]
  tournaments: TournamentSummary[]
  comments: CommentDTO[]
  publications: CommunityPublication[]
  isLoading: boolean
  error: string | null
}

const EMPTY_STATS: ProfileActivityStats = {
  decks: 0,
  tournaments: 0,
  comments: 0,
  publications: 0
}

export function useProfileActivity(): ProfileActivityViewModel {
  const [stats, setStats] = useState<ProfileActivityStats>(EMPTY_STATS)
  const [decks, setDecks] = useState<DeckSummary[]>([])
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([])
  const [comments, setComments] = useState<CommentDTO[]>([])
  const [publications, setPublications] = useState<CommunityPublication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetchProfileActivity()
      .then((activity) => {
        if (!active) return
        setStats(activity.stats)
        setDecks(activity.decks)
        setTournaments(activity.tournaments)
        setComments(activity.comments)
        setPublications(activity.publications)
      })
      .catch((err: unknown) => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Erro ao carregar sua atividade')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { stats, decks, tournaments, comments, publications, isLoading, error }
}
