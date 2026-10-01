// Path: apps/web/src/features/content/views/simulator-card.tsx
// View presentacional: card de simulador da comunidade + ícone por chave.
import { Dice5, Gamepad2, Globe, Swords, Tag } from '@/components'
import { cn } from '@/lib/utils'
import type { SimulatorIconName, SimulatorView } from '../viewmodels/use-simulators'

const ICONS: Record<SimulatorIconName, typeof Gamepad2> = {
  gamepad: Gamepad2,
  globe: Globe,
  swords: Swords,
  dice: Dice5
}

export interface SimulatorIconProps {
  name: SimulatorIconName
  className?: string
}

export function SimulatorIcon({ name, className }: SimulatorIconProps) {
  const Icon = ICONS[name]
  return <Icon className={className} />
}

export interface SimulatorCardProps {
  simulator: SimulatorView
}

export function SimulatorCard({ simulator }: SimulatorCardProps) {
  return (
    <article className="flex flex-col border border-border bg-surface transition-colors hover:border-ink-faint">
      <div className={cn('flex h-[150px] items-center justify-center', simulator.artClass)}>
        <SimulatorIcon name={simulator.icon} className="size-11 text-white" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-lg font-bold text-ink">{simulator.name}</h3>
        <p className="text-sm leading-5 text-ink-soft">{simulator.description}</p>
        {simulator.tag ? (
          <Tag className="mt-1 uppercase tracking-wider">{simulator.tag}</Tag>
        ) : null}
      </div>
    </article>
  )
}
