// Path: apps/web/src/components/ui/card.tsx
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return <div className={cn('border border-border bg-surface', className)} {...props} />
}
