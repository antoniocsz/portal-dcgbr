// Path: apps/web/src/components/post-card.tsx
// View pura: card de notícia/matéria (design system). Sem hooks de dados.
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Sparkles } from './icons'
import { Avatar } from './ui/avatar'
import { Tag } from './ui/tag'

export type PostCardData = {
  category: string
  title: string
  excerpt?: string
  authorName: string
  publishedAt?: string
  readingTime?: string
  coverImage?: string
  href?: string
}

export type PostCardProps = {
  post: PostCardData
  className?: string
}

export function PostCard({ post, className }: PostCardProps) {
  const meta = [post.publishedAt, post.readingTime].filter(Boolean).join(' · ')
  const classes = cn(
    'group flex flex-col overflow-hidden border border-border bg-surface transition-colors hover:border-ink-faint',
    className
  )

  const content = (
    <>
      <div className="relative flex h-44 items-center justify-center bg-[linear-gradient(0deg,var(--color-primary)_0%,var(--color-accent)_100%)]">
        {post.coverImage ? (
          <img src={post.coverImage} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <Sparkles className="size-10 text-white/90" />
        )}
      </div>
      <div className="flex flex-col gap-2.5 p-5">
        <Tag>{post.category}</Tag>
        <h3 className="font-display text-lg font-bold leading-snug text-ink">{post.title}</h3>
        {post.excerpt ? <p className="text-sm leading-5 text-ink-soft">{post.excerpt}</p> : null}
        <div className="flex items-center gap-2">
          <Avatar name={post.authorName} size="sm" />
          <span className="text-[13px] font-semibold text-ink">{post.authorName}</span>
          {meta ? <span className="text-[13px] text-ink-faint">{meta}</span> : null}
        </div>
      </div>
    </>
  )

  if (post.href) {
    return (
      <Link href={post.href} className={classes}>
        {content}
      </Link>
    )
  }

  return <article className={classes}>{content}</article>
}
