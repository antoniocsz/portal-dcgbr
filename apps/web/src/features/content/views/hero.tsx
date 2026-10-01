// Path: apps/web/src/features/content/views/hero.tsx
// View presentacional: destaque da Home (título, resumo, autoria + medidor decorativo).
import Image from 'next/image'
import Link from 'next/link'
import { Avatar, Tag } from '@/components'
import type { FeaturedPostView } from '../viewmodels/post-view'

function MemoryGauge() {
  return (
    <div className="flex w-[200px] flex-col gap-1.5 border border-accent bg-bg/80 p-3.5">
      <span className="text-[10px] font-bold tracking-widest text-ink-faint">MEMÓRIA</span>
      <div className="flex h-2 w-full bg-accent">
        <span className="h-full w-2/5 bg-accent" />
        <span className="h-full flex-1 bg-accent-soft" />
      </div>
      <span className="text-[11px] text-ink-soft">Seu turno · 3 memória</span>
    </div>
  )
}

export interface HeroProps {
  post: FeaturedPostView
}

export function Hero({ post }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface lg:min-h-[440px]">
      <Image
        src="/hero-banner.png"
        alt="Arte do Digimon Card Game"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(-90deg,#0C0C0E_0%,#0C0C0EE6_45%,#0C0C0E00_100%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-10 lg:flex-row lg:items-center lg:gap-12 lg:px-12 lg:py-14">
        <div className="flex flex-1 flex-col gap-4">
          <Tag variant="accent" className="uppercase tracking-wider">
            Matéria em destaque
          </Tag>
          <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[40px] lg:leading-[46px]">
            <Link href={post.href} className="transition-opacity hover:opacity-80">
              {post.title}
            </Link>
          </h1>
          {post.excerpt ? (
            <p className="max-w-2xl text-base leading-6 text-ink-soft">{post.excerpt}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2.5">
            <Avatar name={post.authorName} size="md" />
            <span className="text-[13px] font-semibold text-ink">{post.authorName}</span>
            <span className="text-[13px] text-ink-faint">· {post.categoryLabel}</span>
            {post.publishedLabel ? (
              <span className="text-[13px] text-ink-faint">· {post.publishedLabel}</span>
            ) : null}
          </div>
        </div>
        <div className="hidden w-[420px] shrink-0 items-center justify-center lg:flex">
          <MemoryGauge />
        </div>
      </div>
    </section>
  )
}
