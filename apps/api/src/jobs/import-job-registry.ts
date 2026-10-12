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

export interface ImportJobRegistryOptions {
  /** Máximo de jobs mantidos em memória (os mais recentes). Default: 20. */
  maxJobs?: number
  /** TTL (ms) de jobs finalizados; mais antigos que isso são descartados. Default: 1h. */
  finishedTtlMs?: number
}

const DEFAULT_MAX_JOBS = 20
const DEFAULT_FINISHED_TTL_MS = 60 * 60 * 1000

/** Erros de domínio (AppError) têm mensagem segura; os demais viram mensagem genérica. */
function toSafeMessage(error: unknown): string {
  if (error instanceof AppError) return error.message
  return 'Falha inesperada na importação externa.'
}

export class ImportJobRegistry<TResult> {
  private readonly jobs = new Map<string, ImportJobSnapshot<TResult>>()
  private readonly maxJobs: number
  private readonly finishedTtlMs: number

  constructor(options: ImportJobRegistryOptions = {}) {
    this.maxJobs = options.maxJobs ?? DEFAULT_MAX_JOBS
    this.finishedTtlMs = options.finishedTtlMs ?? DEFAULT_FINISHED_TTL_MS
  }

  /**
   * Expurgo barato (passa no `start()`/`list()`): remove jobs finalizados mais
   * antigos que o TTL e limita o total aos `maxJobs` mais recentes. Jobs `running`
   * nunca são descartados (nem por TTL, nem pelo limite).
   */
  private prune(): void {
    const now = Date.now()
    for (const [id, job] of this.jobs) {
      if (job.status === 'running' || job.finishedAt === null) continue
      if (now - Date.parse(job.finishedAt) > this.finishedTtlMs) this.jobs.delete(id)
    }
    if (this.jobs.size <= this.maxJobs) return
    const finished = [...this.jobs.values()]
      .filter((job) => job.status !== 'running')
      .sort((a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt))
    let excess = this.jobs.size - this.maxJobs
    for (const job of finished) {
      if (excess <= 0) break
      this.jobs.delete(job.id)
      excess -= 1
    }
  }

  /**
   * Dispara `execute` em background e devolve o id do job imediatamente
   * (sem `await`): o handler responde 202 e o cliente acompanha por polling.
   */
  start(execute: () => Promise<TResult>): string {
    this.prune()
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
    this.prune()
    return [...this.jobs.values()]
  }
}
