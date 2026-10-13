// Path: packages/modules/privacy/src/use-cases/create-data-request.ts
// Abre uma solicitação do titular (público). Publica `privacy.request.created`.
import { randomUUID } from 'node:crypto'
import type { EventBus } from '@digimon/contracts'
import { ValidationError } from '@digimon/contracts'
import { DataRequest } from '../domain/entities/data-request'
import { dataRequestCreatedEvent } from '../domain/events/privacy-events'
import type { DataRequestRepository } from '../domain/repositories/data-request-repository'
import { createDataRequestSchema, type CreateDataRequestInput } from './schemas'

export interface CreateDataRequestCommand {
  input: CreateDataRequestInput
  userId?: string | null
}

export class CreateDataRequestUseCase {
  constructor(
    private readonly repo: DataRequestRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateDataRequestCommand): Promise<{ id: string }> {
    const parsed = createDataRequestSchema.safeParse(command.input)
    if (!parsed.success) {
      throw new ValidationError('Dados da solicitação inválidos', parsed.error.flatten())
    }

    const request = DataRequest.create({
      id: randomUUID(),
      type: parsed.data.type,
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      userId: command.userId ?? null
    })

    await this.repo.create(request.data)
    await this.eventBus.publish(dataRequestCreatedEvent(request.id, request.type))

    return { id: request.id }
  }
}
