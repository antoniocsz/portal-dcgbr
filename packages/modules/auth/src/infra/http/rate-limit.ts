// Path: packages/modules/auth/src/infra/http/rate-limit.ts
// Rate limiter in-memory (ADR-005: sem Redis na v1). Janela fixa por chave.
// Registro de conta: 5 req/15min por IP (spec da task).
export class InMemoryRateLimiter {
  private readonly hits = new Map<string, { count: number; resetAt: number }>()

  constructor(
    private readonly max: number,
    private readonly windowMs: number
  ) {}

  /** Retorna true se a requisição é permitida; false se estourou o limite. */
  allow(key: string, now: number = Date.now()): boolean {
    const entry = this.hits.get(key)
    if (!entry || entry.resetAt <= now) {
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs })
      return true
    }
    if (entry.count >= this.max) {
      return false
    }
    entry.count += 1
    return true
  }

  /** Limpeza de entradas expiradas — evita vazamento de memória. */
  prune(now: number = Date.now()): void {
    for (const [key, entry] of this.hits) {
      if (entry.resetAt <= now) {
        this.hits.delete(key)
      }
    }
  }
}
