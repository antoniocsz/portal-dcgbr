// Path: packages/modules/privacy/src/use-cases/privacy.spec.ts
// Critérios dos use cases: registro de consentimento; criação/validação de
// solicitação; listagem com filtro por status; update de status; e autorização
// da fila (administrator|editor) / da auditoria (administrator).
import { describe, expect, it } from 'vitest'
import type { Role } from '@digimon/contracts'
import {
  ForbiddenError,
  InMemoryEventBus,
  NotFoundError,
  ValidationError
} from '@digimon/contracts'
import type { Actor } from '../domain/actor'
import {
  InMemoryConsentRecordRepository,
  InMemoryDataRequestRepository
} from '../test/memory-repositories'
import { CreateDataRequestUseCase } from './create-data-request'
import { ListConsentRecordsUseCase } from './list-consent-records'
import { ListDataRequestsUseCase } from './list-data-requests'
import { RecordConsentUseCase } from './record-consent'
import { UpdateDataRequestStatusUseCase } from './update-data-request-status'

function actor(role: Role, id = 'user-1'): Actor {
  return { id, role }
}

const member = actor('member')
const editor = actor('editor', 'user-2')
const admin = actor('administrator', 'user-3')

function setup() {
  const consentRepo = new InMemoryConsentRecordRepository()
  const dataRequestRepo = new InMemoryDataRequestRepository()
  const eventBus = new InMemoryEventBus()
  const events: string[] = []
  for (const type of ['consent.recorded', 'privacy.request.created', 'privacy.request.updated']) {
    eventBus.subscribe(type, (event) => {
      events.push(event.type)
    })
  }
  return {
    consentRepo,
    dataRequestRepo,
    events,
    recordConsent: new RecordConsentUseCase(consentRepo, eventBus),
    listConsent: new ListConsentRecordsUseCase(consentRepo),
    createRequest: new CreateDataRequestUseCase(dataRequestRepo, eventBus),
    listRequests: new ListDataRequestsUseCase(dataRequestRepo),
    updateStatus: new UpdateDataRequestStatusUseCase(dataRequestRepo, eventBus)
  }
}

function requestInput(overrides: Partial<{ name: string; email: string; message: string }> = {}) {
  return {
    type: 'access' as const,
    name: 'Maria Silva',
    email: 'maria@exemplo.com',
    message: 'Gostaria de acessar meus dados.',
    ...overrides
  }
}

describe('RecordConsentUseCase', () => {
  it('registra consentimento anônimo e publica consent.recorded', async () => {
    const { recordConsent, consentRepo, events } = setup()
    const result = await recordConsent.execute({
      input: { subjectKey: 'subject-1', analytics: true, ads: false },
      userAgent: 'Mozilla/5.0'
    })

    const record = consentRepo.records.find((r) => r.id === result.id)
    expect(record?.subjectKey).toBe('subject-1')
    expect(record?.data.analytics).toBe(true)
    expect(record?.data.ads).toBe(false)
    expect(record?.data.userId).toBeNull()
    expect(events).toEqual(['consent.recorded'])
  })

  it('associa userId quando há sessão', async () => {
    const { recordConsent, consentRepo } = setup()
    const result = await recordConsent.execute({
      input: { subjectKey: 'subject-2', analytics: false, ads: false },
      userId: 'user-9'
    })
    expect(consentRepo.records.find((r) => r.id === result.id)?.data.userId).toBe('user-9')
  })

  it('rejeita dados inválidos com ValidationError', async () => {
    const { recordConsent } = setup()
    const error = await recordConsent
      .execute({ input: { subjectKey: '  ', analytics: true, ads: false } })
      .catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ValidationError)
  })
})

describe('CreateDataRequestUseCase', () => {
  it('abre solicitação e publica privacy.request.created', async () => {
    const { createRequest, dataRequestRepo, events } = setup()
    const result = await createRequest.execute({ input: requestInput() })

    const request = await dataRequestRepo.findById(result.id)
    expect(request?.status).toBe('open')
    expect(request?.data.email).toBe('maria@exemplo.com')
    expect(events).toEqual(['privacy.request.created'])
  })

  it('rejeita e-mail inválido com ValidationError', async () => {
    const { createRequest } = setup()
    const error = await createRequest
      .execute({ input: requestInput({ email: 'nao-e-email' }) })
      .catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ValidationError)
    expect((error as ValidationError).details).toMatchObject({
      fieldErrors: { email: expect.any(Array) }
    })
  })
})

describe('ListDataRequestsUseCase — autorização e filtro', () => {
  it('member não acessa a fila (ForbiddenError)', async () => {
    const { listRequests } = setup()
    await expect(listRequests.execute({ actor: member })).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('administrator lista e filtra por status', async () => {
    const { createRequest, listRequests, updateStatus } = setup()
    const a = await createRequest.execute({ input: requestInput({ email: 'a@exemplo.com' }) })
    await createRequest.execute({ input: requestInput({ email: 'b@exemplo.com' }) })
    await updateStatus.execute({ actor: admin, id: a.id, input: { status: 'done' } })

    const open = await listRequests.execute({ actor: admin, input: { status: 'open' } })
    expect(open.items).toHaveLength(1)
    expect(open.total).toBe(1)

    const all = await listRequests.execute({ actor: editor })
    expect(all.total).toBe(2)
  })
})

describe('UpdateDataRequestStatusUseCase', () => {
  it('editor atualiza o status e publica privacy.request.updated', async () => {
    const { createRequest, updateStatus, dataRequestRepo, events } = setup()
    const created = await createRequest.execute({ input: requestInput() })

    const result = await updateStatus.execute({
      actor: editor,
      id: created.id,
      input: { status: 'in_progress' }
    })
    expect(result.status).toBe('in_progress')
    expect((await dataRequestRepo.findById(created.id))?.status).toBe('in_progress')
    expect(events).toEqual(['privacy.request.created', 'privacy.request.updated'])
  })

  it('member é bloqueado (ForbiddenError)', async () => {
    const { createRequest, updateStatus } = setup()
    const created = await createRequest.execute({ input: requestInput() })
    await expect(
      updateStatus.execute({ actor: member, id: created.id, input: { status: 'done' } })
    ).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('solicitação inexistente lança NotFound', async () => {
    const { updateStatus } = setup()
    await expect(
      updateStatus.execute({ actor: admin, id: 'nao-existe', input: { status: 'done' } })
    ).rejects.toBeInstanceOf(NotFoundError)
  })
})

describe('ListConsentRecordsUseCase — auditoria só administrator', () => {
  it('administrator lista; editor e member são bloqueados', async () => {
    const { recordConsent, listConsent } = setup()
    await recordConsent.execute({ input: { subjectKey: 's-1', analytics: true, ads: false } })
    await recordConsent.execute({ input: { subjectKey: 's-2', analytics: false, ads: false } })

    const result = await listConsent.execute({ actor: admin })
    expect(result.total).toBe(2)

    await expect(listConsent.execute({ actor: editor })).rejects.toBeInstanceOf(ForbiddenError)
    await expect(listConsent.execute({ actor: member })).rejects.toBeInstanceOf(ForbiddenError)
  })
})
