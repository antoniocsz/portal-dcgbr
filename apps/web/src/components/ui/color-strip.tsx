// Path: apps/web/src/components/ui/color-strip.tsx
import { cn } from '@/lib/utils'

// Faixa de 7 cores dos atributos (header/footer do dcg.pen).
const STRIP_COLORS = [
  'bg-c-red',
  'bg-c-blue',
  'bg-c-yellow',
  'bg-c-green',
  'bg-c-purple',
  'bg-c-black',
  'bg-white'
] as const

export type ColorStripProps = {
  className?: string
}

export function ColorStrip({ className }: ColorStripProps) {
  return (
    <div className={cn('flex h-1 w-full overflow-hidden', className)} aria-hidden="true">
      {STRIP_COLORS.map((color) => (
        <span key={color} className={cn('h-full flex-1', color)} />
      ))}
    </div>
  )
}
