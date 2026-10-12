// Path: apps/api/src/jobs/import-job-registry.ts
// Registry de jobs de importação em memória (process-local). A importação externa
// é custosa (~39s, 8,7 MB + milhares de upserts) e, atrás de proxy (Coolify/nginx),
// pode estourar o timeout da requisição — o job roda em background (fire-and-forget)
// e o progresso é consultado por polling. Sem Redis (ADR-005): o estado é volátil e
// **some em restart do processo** (documentado como limitação conhecida).
import { randomUUID } from 'node:crypto'
import { AppError } from '@digimon/contracts'

export type ImportJobStatus = 'running' | 'done' | 'error'

export interface ImportJobSnapshot<TResult> {
  id: string
  status: ImportJobStatus
  startedAt: string
  finishedAt: string | null
  result?: TResult
  error?: string
}

/** Erros de domínio (AppError) têm mensagem segura; os demais viram mensagem genérica. */
function toSafeMessage(error: unknown): string {
  if (error instanceof AppError) return error.message
  return 'Falha inesperada na importação externa.'
}

export class ImportJobRegistry<TResult> {
  private readonly jobs = new Map<string, ImportJobSnapshot<TResult>>()

  /**
   * Dispara `execute` em background e devolve o id do job imediatamente
   * (sem `await`): o handler responde 202 e o cliente acompanha por polling.
   */
  start(execute: () => Promise<TResult>): string {
    const id = randomUUID()
    this.jobs.set(id, {
      id,
      status: 'running',
      startedAt: new Date().toISOString(),
      finishedAt: null
    })

    // `.then(onFulfilled, onRejected)` — erro do job nunca vira unhandled rejection.
    void execute().then(
      (result) => this.succeed(id, result),
      (error: unknown) => this.fail(id, error)
    )

    return id
  }

  succeed(id: string, result: TResult): void {
    const job = this.jobs.get(id)
    if (!job) return
    this.jobs.set(id, {
      ...job,
      status: 'done',
      result,
      finishedAt: new Date().toISOString()
    })
  }

  fail(id: string, error: unknown): void {
    const job = this.jobs.get(id)
    if (!job) return
    this.jobs.set(id, {
      ...job,
      status: 'error',
      error: toSafeMessage(error),
      finishedAt: new Date().toISOString()
    })
  }

  get(id: string): ImportJobSnapshot<TResult> | undefined {
    return this.jobs.get(id)
  }

  list(): ImportJobSnapshot<TResult>[] {
    return [...this.jobs.values()]
  }
}
