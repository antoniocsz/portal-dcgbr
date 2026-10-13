// Path: apps/api/src/routes/privacy.ts
// Rotas de LGPD em Fastify — bounded context @digimon/privacy.
// Público: registra consentimento (best-effort → 204) e abre solicitações do
// titular (art. 18 §3º). Admin: fila de solicitações (administrator|editor) e
// auditoria de consentimento (administrator). Erros de domínio são traduzidos
// pelo handler global. Sem `new PrismaClient` aqui — composição no container.
import type { FastifyPluginAsync, FastifyRequest } from 'fastify'
import type { PaginatedResult } from '@digimon/contracts'
import { requireRole } from '@digimon/auth'
import {
  createDataRequestSchema,
  listConsentRecordsSchema,
  listDataRequestsSchema,
  recordConsentSchema,
  updateDataRequestStatusSchema
} from '@digimon/privacy'
import type {
  Actor,
  ConsentRecord,
  CreateDataRequestInput,
  DataRequest,
  DataRequestStatus,
  DataRequestType,
  UpdateDataRequestStatusInput
} from '@digimon/privacy'
import { privacyDeps } from '../container'
import { getAuthContext } from '../plugins/auth'

// --- Composição (DIP): factories centralizadas no container -----------------
const {
  recordConsent,
  listConsentRecords,
  createDataRequest,
  listDataRequests,
  updateDataRequestStatus
} = privacyDeps()

// --- Serialização (Date → ISO) ----------------------------------------------
interface ConsentRecordDTO {
  id: string
  subjectKey: string
  userId: string | null
  analytics: boolean
  ads: boolean
  policyVersion: string
  userAgent: string | null
  createdAt: string
}

function serializeConsentRecord(record: ConsentRecord): ConsentRecordDTO {
  const d = record.data
  return {
    id: d.id,
    subjectKey: d.subjectKey,
    userId: d.userId,
    analytics: d.analytics,
    ads: d.ads,
    policyVersion: d.policyVersion,
    userAgent: d.userAgent,
    createdAt: d.createdAt.toISOString()
  }
}

interface DataRequestDTO {
  id: string
  type: DataRequestType
  name: string
  email: string
  message: string
  userId: string | null
  status: DataRequestStatus
  createdAt: string
  updatedAt: string
}

function serializeDataRequest(request: DataRequest): DataRequestDTO {
  const d = request.data
  return {
    id: d.id,
    type: d.type,
    name: d.name,
    email: d.email,
    message: d.message,
    userId: d.userId,
    status: d.status,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString()
  }
}

function serializeList<T, D>(
  result: PaginatedResult<T>,
  serialize: (item: T) => D
): PaginatedResult<D> {
  return {
    items: result.items.map(serialize),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize
  }
}

// --- Sessão ------------------------------------------------------------------
/** Ator da fila de solicitações: administrator|editor (401 sem sessão, 403 com papel diferente). */
function requireQueueActor(request: FastifyRequest): Actor {
  const context = getAuthContext(request)
  requireRole(context, ['administrator', 'editor'])
  return { id: context.userId, role: context.role }
}

/** Ator da auditoria de consentimento: somente administrator. */
function requireAuditActor(request: FastifyRequest): Actor {
  const context = getAuthContext(request)
  requireRole(context, 'administrator')
  return { id: context.userId, role: context.role }
}

/** userId da sessão, se houver — sem lançar em rotas públicas. */
function optionalUserId(request: FastifyRequest): string | null {
  try {
    return getAuthContext(request).userId
  } catch {
    return null
  }
}

// --- Query params ------------------------------------------------------------
function queryString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (Array.isArray(value)) return queryString(value[0])
  return String(value)
}

export const privacyRoutes: FastifyPluginAsync = async (app) => {
  // POST /consent — público: registra a decisão de consentimento (best-effort).
  // Sempre 204: o cliente não deve falhar nem bloquear por causa do registro.
  app.post('/consent', async (request, reply) => {
    try {
      const input = recordConsentSchema.parse(request.body ?? {})
      await recordConsent.execute({
        input,
        userId: optionalUserId(request),
        userAgent: request.headers['user-agent'] ?? null
      })
    } catch (error) {
      request.log.warn({ err: error }, 'falha ao registrar consentimento')
    }
    return reply.status(204).send()
  })

  // POST /privacy/requests — público: abre uma solicitação do titular → 201 { id }.
  app.post<{ Body: CreateDataRequestInput }>('/privacy/requests', async (request, reply) => {
    const result = await createDataRequest.execute({
      input: createDataRequestSchema.parse(request.body ?? {}),
      userId: optionalUserId(request)
    })
    return reply.status(201).send(result)
  })

  // GET /admin/privacy/requests — fila (administrator|editor), filtro `status`.
  app.get<{ Querystring: Record<string, unknown> }>(
    '/admin/privacy/requests',
    async (request, reply) => {
      const actor = requireQueueActor(request)
      const input = listDataRequestsSchema.parse({
        status: queryString(request.query.status),
        page: queryString(request.query.page),
        pageSize: queryString(request.query.pageSize)
      })
      const result = await listDataRequests.execute({ actor, input })
      return reply.send(serializeList(result, serializeDataRequest))
    }
  )

  // PATCH /admin/privacy/requests/:id — atualiza o status (administrator|editor) → 200.
  app.patch<{ Params: { id: string }; Body: UpdateDataRequestStatusInput }>(
    '/admin/privacy/requests/:id',
    async (request, reply) => {
      const actor = requireQueueActor(request)
      const result = await updateDataRequestStatus.execute({
        actor,
        id: request.params.id,
        input: updateDataRequestStatusSchema.parse(request.body ?? {})
      })
      return reply.send(result)
    }
  )

  // GET /admin/consent — auditoria de consentimento (administrator) → { items, total }.
  app.get<{ Querystring: Record<string, unknown> }>('/admin/consent', async (request, reply) => {
    const actor = requireAuditActor(request)
    const input = listConsentRecordsSchema.parse({
      page: queryString(request.query.page),
      pageSize: queryString(request.query.pageSize)
    })
    const result = await listConsentRecords.execute({ actor, input })
    return reply.send(serializeList(result, serializeConsentRecord))
  })
}
