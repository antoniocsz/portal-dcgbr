// Path: packages/modules/ads/src/domain/entities/ad.ts
// Aggregate raiz do módulo ads. Suporta house ads (e-commerce próprio),
// patrocínio direto e links de afiliado. Invariantes: targetUrl http(s),
// placements com ao menos 1 item, title não vazio e priority >= 0.
import { ValidationError } from '@digimon/contracts'

export type AdKind = 'house' | 'affiliate' | 'sponsor'

export interface AdData {
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
  startAt: Date | null
  endAt: Date | null
  openInNewTab: boolean
  impressions: number
  clicks: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateAdData {
  id: string
  title: string
  subtitle?: string | null
  imageUrl?: string | null
  targetUrl: string
  kind: AdKind
  placements: string[]
  ctaLabel?: string | null
  sponsorName?: string | null
  disclosure?: string | null
  isActive?: boolean
  priority?: number
  startAt?: Date | null
  endAt?: Date | null
  openInNewTab?: boolean
  createdBy: string
}

export interface UpdateAdData {
  title?: string
  subtitle?: string | null
  imageUrl?: string | null
  targetUrl?: string
  kind?: AdKind
  placements?: string[]
  ctaLabel?: string | null
  sponsorName?: string | null
  disclosure?: string | null
  isActive?: boolean
  priority?: number
  startAt?: Date | null
  endAt?: Date | null
  openInNewTab?: boolean
}

const HTTP_URL_PATTERN = /^https?:\/\//i

type AdInvariants = Pick<
  AdData,
  'title' | 'targetUrl' | 'placements' | 'priority' | 'startAt' | 'endAt'
>

function assertInvariants(data: AdInvariants): void {
  if (data.title.trim().length === 0) {
    throw new ValidationError('Título do anúncio é obrigatório')
  }
  if (!HTTP_URL_PATTERN.test(data.targetUrl)) {
    throw new ValidationError('targetUrl deve ser uma URL http(s)')
  }
  if (data.placements.length < 1) {
    throw new ValidationError('O anúncio deve ter ao menos um placement')
  }
  if (data.priority < 0) {
    throw new ValidationError('priority deve ser maior ou igual a 0')
  }
  if (data.startAt && data.endAt && data.startAt > data.endAt) {
    throw new ValidationError('startAt não pode ser posterior a endAt')
  }
}

export class Ad {
  private constructor(public readonly data: AdData) {}

  static create(props: CreateAdData): Ad {
    const now = new Date()
    const data: AdData = {
      id: props.id,
      title: props.title,
      subtitle: props.subtitle ?? null,
      imageUrl: props.imageUrl ?? null,
      targetUrl: props.targetUrl,
      kind: props.kind,
      placements: [...props.placements],
      ctaLabel: props.ctaLabel ?? null,
      sponsorName: props.sponsorName ?? null,
      disclosure: props.disclosure ?? null,
      isActive: props.isActive ?? true,
      priority: props.priority ?? 0,
      startAt: props.startAt ?? null,
      endAt: props.endAt ?? null,
      openInNewTab: props.openInNewTab ?? true,
      impressions: 0,
      clicks: 0,
      createdBy: props.createdBy,
      createdAt: now,
      updatedAt: now
    }
    assertInvariants(data)
    return new Ad(data)
  }

  static fromData(data: AdData): Ad {
    return new Ad(data)
  }

  get id(): string {
    return this.data.id
  }

  get kind(): AdKind {
    return this.data.kind
  }

  get isActive(): boolean {
    return this.data.isActive
  }

  get priority(): number {
    return this.data.priority
  }

  get createdBy(): string {
    return this.data.createdBy
  }

  /** Edita o criativo/agendamento. Contadores (impressions/clicks) nunca mudam aqui. */
  update(patch: UpdateAdData): void {
    const d = this.data
    if (patch.title !== undefined) d.title = patch.title
    if (patch.subtitle !== undefined) d.subtitle = patch.subtitle
    if (patch.imageUrl !== undefined) d.imageUrl = patch.imageUrl
    if (patch.targetUrl !== undefined) d.targetUrl = patch.targetUrl
    if (patch.kind !== undefined) d.kind = patch.kind
    if (patch.placements !== undefined) d.placements = [...patch.placements]
    if (patch.ctaLabel !== undefined) d.ctaLabel = patch.ctaLabel
    if (patch.sponsorName !== undefined) d.sponsorName = patch.sponsorName
    if (patch.disclosure !== undefined) d.disclosure = patch.disclosure
    if (patch.isActive !== undefined) d.isActive = patch.isActive
    if (patch.priority !== undefined) d.priority = patch.priority
    if (patch.startAt !== undefined) d.startAt = patch.startAt
    if (patch.endAt !== undefined) d.endAt = patch.endAt
    if (patch.openInNewTab !== undefined) d.openInNewTab = patch.openInNewTab

    assertInvariants(d)
    d.updatedAt = new Date()
  }

  /** Visível em `date`: ativo e dentro da janela opcional startAt/endAt. */
  isVisibleAt(date: Date): boolean {
    const d = this.data
    if (!d.isActive) return false
    if (d.startAt && date < d.startAt) return false
    if (d.endAt && date > d.endAt) return false
    return true
  }
}
