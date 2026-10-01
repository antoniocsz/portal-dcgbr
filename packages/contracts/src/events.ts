// Eventos de domínio e EventBus — pub/sub in-process desacoplado.
// ADR-005: EventBus in-process na v1, sem fila externa.

export interface DomainEvent {
  type: string
  occurredAt: Date
}

export type EventHandler = (event: DomainEvent) => void | Promise<void>

export interface EventBus {
  publish(event: DomainEvent): Promise<void>
  subscribe(type: string, handler: EventHandler): () => void
}

export class InMemoryEventBus implements EventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>()

  subscribe(type: string, handler: EventHandler): () => void {
    const set = this.handlers.get(type) ?? new Set<EventHandler>()
    set.add(handler)
    this.handlers.set(type, set)
    return () => {
      set.delete(handler)
      if (set.size === 0) this.handlers.delete(type)
    }
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.type)
    if (!handlers) return
    await Promise.all([...handlers].map((handler) => handler(event)))
  }
}
