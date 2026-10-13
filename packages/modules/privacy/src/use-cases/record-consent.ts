// Path: packages/modules/privacy/src/use-cases/record-consent.ts
// Registra uma decisão de consentimento (público; best-effort no cliente).
// O `subjectKey` vem do navegador (opaco); o `userId` é preenchido quando há
// sessão. Publica `consent.recorded`.
import { randomUUID } from 'node:crypto'
import type { EventBus } from '@digimon/contracts'
import { ValidationError } from '@digimon/contracts'
import { ConsentRecord, DEFAULT_POLICY_VERSION } from '../domain/entities/consent-record'
import { consentRecordedEvent } from '../domain/events/privacy-events'
import type { ConsentRecordRepository } from '../domain/repositories/consent-record-repository'
import { recordConsentSchema, type RecordConsentInput } from './schemas'

export interface RecordConsentCommand {
  input: RecordConsentInput
  userId?: string | null
  userAgent?: string | null
}

export class RecordConsentUseCase {
  constructor(
    private readonly repo: ConsentRecordRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: RecordConsentCommand): Promise<{ id: string }> {
    const parsed = recordConsentSchema.safeParse(command.input)
    if (!parsed.success) {
      throw new ValidationError('Dados de consentimento inválidos', parsed.error.flatten())
    }

    const record = ConsentRecord.create({
      id: randomUUID(),
      subjectKey: parsed.data.subjectKey,
      userId: command.userId ?? null,
      analytics: parsed.data.analytics,
      ads: parsed.data.ads,
      policyVersion: parsed.data.policyVersion ?? DEFAULT_POLICY_VERSION,
      userAgent: command.userAgent ?? null
    })

    await this.repo.create(record.data)
    await this.eventBus.publish(consentRecordedEvent(record.subjectKey))

    return { id: record.id }
  }
}
