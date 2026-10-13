// Path: packages/modules/privacy/src/domain/entities/consent-record.spec.ts
// Critérios: invariantes do ConsentRecord (subjectKey/policyVersion não vazios,
// defaults de policyVersion/createdAt) e truncamento do userAgent.
import { describe, expect, it } from 'vitest'
import { ValidationError } from '@digimon/contracts'
import {
  ConsentRecord,
  DEFAULT_POLICY_VERSION,
  MAX_USER_AGENT_LENGTH,
  type CreateConsentRecordData
} from './consent-record'

function build(overrides: Partial<CreateConsentRecordData> = {}): CreateConsentRecordData {
  return {
    id: 'consent-1',
    subjectKey: 'subject-opaco-1',
    analytics: true,
    ads: false,
    ...overrides
  }
}

describe('ConsentRecord — invariantes', () => {
  it('cria com defaults (policyVersion vigente, userId/userAgent nulos)', () => {
    const record = ConsentRecord.create(build())
    expect(record.data.policyVersion).toBe(DEFAULT_POLICY_VERSION)
    expect(record.data.userId).toBeNull()
    expect(record.data.userAgent).toBeNull()
    expect(record.data.analytics).toBe(true)
    expect(record.data.ads).toBe(false)
    expect(record.data.createdAt).toBeInstanceOf(Date)
  })

  it('rejeita subjectKey vazio ou só espaços', () => {
    expect(() => ConsentRecord.create(build({ subjectKey: '' }))).toThrow(ValidationError)
    expect(() => ConsentRecord.create(build({ subjectKey: '   ' }))).toThrow(ValidationError)
  })

  it('rejeita policyVersion vazio', () => {
    expect(() => ConsentRecord.create(build({ policyVersion: '' }))).toThrow(ValidationError)
  })

  it('trunca userAgent acima do teto e descarta o vazio', () => {
    const long = 'a'.repeat(MAX_USER_AGENT_LENGTH + 50)
    const record = ConsentRecord.create(build({ userAgent: long }))
    expect(record.data.userAgent).toHaveLength(MAX_USER_AGENT_LENGTH)

    const empty = ConsentRecord.create(build({ userAgent: '  ' }))
    expect(empty.data.userAgent).toBeNull()
  })
})
