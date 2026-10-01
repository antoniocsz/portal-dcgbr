// Path: apps/web/src/components/ui/color-chip.tsx
import { cn } from '@/lib/utils'
import { ATTRIBUTE_COLORS, ATTRIBUTE_LABELS } from '../attribute-colors'

const COLORS: Record<string, string> = ATTRIBUTE_COLORS
const LABELS: Record<string, string> = ATTRIBUTE_LABELS

export type ColorChipProps = {
  color: string
  label?: string
  className?: string
}

export function ColorChip({ color, label, className }: ColorChipProps) {
  const hex = COLORS[color] ?? color
  const text = label ?? LABELS[color]
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 border border-border bg-surface px-2.5 py-[5px] text-xs font-semibold text-ink',
        className
      )}
    >
      <span className="size-2.5 rounded-full" style={{ backgroundColor: hex }} aria-hidden="true" />
      {text}
    </span>
  )
}
