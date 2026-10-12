// Path: apps/web/src/features/ads/model/types.ts
// Tipos da feature ads (espelho do AdDTO da API /ads).
// Decisão: o frontend NÃO importa @digimon/ads no client (evita arrastar
// @digimon/database para o bundle) — tipos literais mantidos em sync com o backend.

export type AdKind = 'house' | 'affiliate' | 'sponsor'

// Posições servidas pelo portal (o backend aceita qualquer string; estas são as
// usadas pelas páginas públicas — task 104).
export type AdPlacement = 'home-top' | 'home-infeed' | 'cards-top' | 'article-inline'

export interface Ad {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string | null
  targetUrl: string
  kind: AdKind
  placements: string[]
  ctaLabel: string | null
  sponsorName: string | null
  disclosure: string | null
  isActive: boolean
  priority: number
  startAt: string | null
  endAt: string | null
  openInNewTab: boolean
  impressions: number
  clicks: number
  createdAt: string
  updatedAt: string
}
