// Path: apps/web/src/features/admin/views/moderation-queue.tsx
// View pura: fila de moderação (avatar, contexto, sinalização e ações).
import { Avatar, Button, Card, StatusBadge } from '@/components'
import type { ModerationItem } from '../model/types'

export interface ModerationQueueProps {
  title: string
  items: ModerationItem[]
  onHide: (id: string) => void
  onKeep: (id: string) => void
  busyId?: string | null
}

export function ModerationQueue({
  title,
  items,
  onHide,
  onKeep,
  busyId = null
}: ModerationQueueProps) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>

      {items.length === 0 ? <p className="text-sm text-ink-faint">Nada pendente.</p> : null}

      {items.map((item) => (
        <div key={item.id} className="flex flex-wrap items-center gap-3 bg-surface-2 p-3">
          <Avatar name={item.authorName} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-[13px] font-bold text-ink">{item.title}</span>
            <span className="text-[13px] text-ink-soft">{item.detail}</span>
          </div>
          <StatusBadge tone={item.tone === 'danger' ? 'danger' : 'warning'}>Sinalizado</StatusBadge>
          <div className="flex items-center gap-2">
            <Button variant="dark" size="sm" onClick={() => onHide(item.id)} disabled={busyId === item.id}>
              Ocultar
            </Button>
            <Button size="sm" onClick={() => onKeep(item.id)} disabled={busyId === item.id}>
              Manter
            </Button>
          </div>
        </div>
      ))}
    </Card>
  )
}
