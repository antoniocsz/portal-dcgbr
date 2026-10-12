// Path: apps/web/src/components/ad-slot.tsx
// View do design system: slot de anúncio. Reserva altura (evita CLS) e não
// renderiza nada quando não há anúncio. Criativo com <img> nativo — o host é
// dinâmico (CDN próprio/links de afiliado), então NÃO depende de remotePatterns
// do next.config. View só renderiza; busca + rotação + tracking ficam no
// ViewModel useAdSlot (features/ads).
'use client'

import { cn } from '@/lib/utils'
import { useAdSlot } from '@/features/ads/viewmodels'
import type { Ad, AdPlacement } from '@/features/ads/model/types'
import { ArrowRight, Sparkles } from './icons'

export interface AdSlotProps {
  placement: AdPlacement
  /** Nº de anúncios (in-feed). Default 1 (item único com rotação por peso). */
  count?: number
  className?: string
}

/** Rótulo de divulgação: `disclosure` explícito ou default por tipo de anúncio. */
function disclosureLabel(ad: Ad): string | null {
  if (ad.disclosure) return ad.disclosure
  if (ad.kind === 'affiliate') return 'Publicidade'
  if (ad.kind === 'sponsor') return 'Parceiro'
  return null
}

/** `rel` do link: patrocinado (affiliate/sponsor) ou padrão (house). */
function linkRel(ad: Ad): string {
  const sponsored = ad.kind === 'affiliate' || ad.kind === 'sponsor'
  return sponsored ? 'sponsored nofollow noopener' : 'noopener'
}

interface AdCreativeProps {
  ad: Ad
  onTrackClick: (id: string) => void
}

function DisclosureBadge({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute right-0 top-0 bg-bg/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
      {label}
    </span>
  )
}

function AdBanner({ ad, onTrackClick }: AdCreativeProps) {
  const label = disclosureLabel(ad)
  const cta = ad.ctaLabel ?? 'Saiba mais'

  return (
    <a
      href={ad.targetUrl}
      target={ad.openInNewTab ? '_blank' : undefined}
      rel={linkRel(ad)}
      onClick={() => onTrackClick(ad.id)}
      className="group relative flex h-28 items-center overflow-hidden border border-border bg-surface transition-colors hover:border-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:h-36"
    >
      {ad.imageUrl ? (
        <img
          src={ad.imageUrl}
          alt={ad.title}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div className="flex flex-col gap-1 px-5">
          <p className="font-display text-lg font-bold text-ink">{ad.title}</p>
          {ad.subtitle ? <p className="text-sm text-ink-soft">{ad.subtitle}</p> : null}
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary">
            {cta} <ArrowRight className="size-3.5" />
          </span>
        </div>
      )}

      {ad.imageUrl ? (
        <span className="pointer-events-none absolute bottom-3 left-4 inline-flex items-center gap-1 bg-bg/80 px-2.5 py-1 text-[12px] font-semibold text-ink">
          {cta} <ArrowRight className="size-3" />
        </span>
      ) : null}

      {label ? <DisclosureBadge label={label} /> : null}
    </a>
  )
}

function AdCard({ ad, onTrackClick }: AdCreativeProps) {
  const label = disclosureLabel(ad)
  const cta = ad.ctaLabel ?? 'Saiba mais'

  return (
    <article className="flex overflow-hidden border border-border bg-surface transition-colors hover:border-ink-faint">
      <a
        href={ad.targetUrl}
        target={ad.openInNewTab ? '_blank' : undefined}
        rel={linkRel(ad)}
        onClick={() => onTrackClick(ad.id)}
        className="group flex h-full w-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <div className="relative flex h-40 items-center justify-center bg-surface-2">
          {ad.imageUrl ? (
            <img
              src={ad.imageUrl}
              alt={ad.title}
              loading="lazy"
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <Sparkles className="size-10 text-ink-faint" />
          )}
          {label ? <DisclosureBadge label={label} /> : null}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          {ad.sponsorName ? (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
              {ad.sponsorName}
            </span>
          ) : null}
          <h3 className="font-display text-base font-bold leading-snug text-ink">{ad.title}</h3>
          {ad.subtitle ? <p className="text-sm leading-5 text-ink-soft">{ad.subtitle}</p> : null}
          <span className="mt-auto inline-flex items-center gap-1 pt-1 text-[13px] font-semibold text-primary">
            {cta} <ArrowRight className="size-3.5" />
          </span>
        </div>
      </a>
    </article>
  )
}

function AdSlotSkeleton({ count, className }: { count: number; className?: string | undefined }) {
  if (count > 1) {
    return (
      <div className={cn('grid gap-4 sm:grid-cols-2', className)} aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="h-64 animate-pulse border border-border bg-surface" />
        ))}
      </div>
    )
  }
  return (
    <div
      className={cn('h-28 animate-pulse border border-border bg-surface sm:h-36', className)}
      aria-hidden="true"
    />
  )
}

export function AdSlot({ placement, count = 1, className }: AdSlotProps) {
  const { ads, isLoading, trackClick } = useAdSlot(placement, { count })

  if (isLoading) return <AdSlotSkeleton count={count} className={className} />
  if (ads.length === 0) return null

  if (count > 1) {
    return (
      <aside aria-label="Publicidade" className={cn('grid gap-4 sm:grid-cols-2', className)}>
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} onTrackClick={trackClick} />
        ))}
      </aside>
    )
  }

  const [ad] = ads
  if (!ad) return null
  return (
    <aside aria-label="Publicidade" className={className}>
      <AdBanner ad={ad} onTrackClick={trackClick} />
    </aside>
  )
}
