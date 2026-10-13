// Path: packages/modules/privacy/src/domain/entities/data-request.spec.ts
// Critérios: invariantes do DataRequest (nome/mensagem não vazios, e-mail
// válido), status inicial `open` e transição de status.
import { describe, expect, it } from 'vitest'
import { ValidationError } from '@digimon/contracts'
import { DataRequest, type CreateDataRequestData } from './data-request'

function build(overrides: Partial<CreateDataRequestData> = {}): CreateDataRequestData {
  return {
    id: 'request-1',
    type: 'access',
    name: 'Maria Silva',
    email: 'maria@exemplo.com',
    message: 'Gostaria de acessar meus dados.',
    ...overrides
  }
}

describe('DataRequest — invariantes', () => {
  it('cria com status open e normaliza espaços', () => {
    const request = DataRequest.create(build({ name: '  Maria  ', message: '  olá  ' }))
    expect(request.status).toBe('open')
    expect(request.data.name).toBe('Maria')
    expect(request.data.message).toBe('olá')
    expect(request.data.userId).toBeNull()
    expect(request.data.createdAt).toEqual(request.data.updatedAt)
  })

  it('rejeita nome vazio', () => {
    expect(() => DataRequest.create(build({ name: '   ' }))).toThrow(ValidationError)
  })

  it('rejeita e-mail inválido', () => {
    expect(() => DataRequest.create(build({ email: 'sem-arroba' }))).toThrow(ValidationError)
    expect(() => DataRequest.create(build({ email: 'a@b' }))).toThrow(ValidationError)
  })

  it('rejeita mensagem vazia', () => {
    expect(() => DataRequest.create(build({ message: '   ' }))).toThrow(ValidationError)
  })

  it('updateStatus muda o status e atualiza updatedAt', () => {
    const request = DataRequest.create(build({ createdAt: new Date('2026-01-01T00:00:00Z') }))
    request.updateStatus('in_progress')
    expect(request.status).toBe('in_progress')
    expect(request.data.updatedAt.getTime()).toBeGreaterThan(request.data.createdAt.getTime())
  })
})
