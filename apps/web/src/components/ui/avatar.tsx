// Path: apps/web/src/components/ui/avatar.tsx
import { cn } from '@/lib/utils'

export type AvatarSize = 'sm' | 'md' | 'lg'

const SIZES: Record<AvatarSize, string> = {
  sm: 'size-6 text-[10px]',
  md: 'size-8 text-xs',
  lg: 'size-10 text-sm'
}

export type AvatarProps = {
  name: string
  size?: AvatarSize
  tone?: 'soft' | 'solid'
  src?: string
  className?: string
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.charAt(0) ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) ?? '' : ''
  return (first + last).toUpperCase() || '?'
}

export function Avatar({ name, size = 'md', tone = 'soft', src, className }: AvatarProps) {
  return (
    <span
      title={name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden font-bold',
        SIZES[size],
        tone === 'solid' ? 'bg-primary text-white' : 'bg-primary-soft text-primary',
        className
      )}
    >
      {src ? <img src={src} alt={name} className="size-full object-cover" /> : initials(name)}
    </span>
  )
}
