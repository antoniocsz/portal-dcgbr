// Path: apps/web/src/components/ui/button.tsx
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'ghost' | 'dark'
export type ButtonSize = 'sm' | 'md'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90 active:bg-primary',
  dark: 'border border-border bg-surface text-ink hover:border-ink-faint',
  ghost: 'bg-transparent text-ink-soft hover:bg-surface-2 hover:text-ink'
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-4.5 text-sm'
}

export function buttonVariants({ variant = 'primary', size = 'md' }: {
  variant?: ButtonVariant
  size?: ButtonSize
} = {}): string {
  return cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold',
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size]
  )
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className)
  return <button type={type} className={classes} {...props} />
}
