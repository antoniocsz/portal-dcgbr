// Path: apps/web/src/components/ui/tag.tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type TagProps = {
  variant?: 'default' | 'accent'
  className?: string
  children: ReactNode
}

export function Tag({ variant = 'default', className, children }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center bg-surface-2 px-2.5 py-[5px] text-xs font-semibold leading-none',
        variant === 'accent' ? 'text-accent' : 'text-ink-soft',
        className
      )}
    >
      {children}
    </span>
  )
}
