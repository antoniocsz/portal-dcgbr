// Path: packages/modules/privacy/src/use-cases/update-data-request-status.ts
// Atualiza o status do atendimento (administrator|editor) e publica
// `privacy.request.updated`. 404 (NotFoundError) se a solicitação não existir.
import type { EventBus } from '@digimon/contracts'
import { NotFoundError, ValidationError } from '@digimon/contracts'
import { requireQueueManager, type Actor } from '../domain/actor'
import type { DataRequestStatus } from '../domain/entities/data-request'
import { dataRequestUpdatedEvent } from '../domain/events/privacy-events'
import type { DataRequestRepository } from '../domain/repositories/data-request-repository'
import {
  updateDataRequestStatusSchema,
  type UpdateDataRequestStatusInput
} from './schemas'

export interface UpdateDataRequestStatusCommand {
  actor: Actor
  id: string
  input: UpdateDataRequestStatusInput
}

export class UpdateDataRequestStatusUseCase {
  constructor(
    private readonly repo: DataRequestRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(
    command: UpdateDataRequestStatusCommand
  ): Promise<{ id: string; status: DataRequestStatus }> {
    requireQueueManager(command.actor)

    const parsed = updateDataRequestStatusSchema.safeParse(command.input)
    if (!parsed.success) {
      throw new ValidationError('Status inválido', parsed.error.flatten())
    }

    const request = await this.repo.findById(command.id)
    if (!request) {
      throw new NotFoundError('Solicitação não encontrada')
    }

    request.updateStatus(parsed.data.status)
    await this.repo.updateStatus(request.id, request.status, request.data.updatedAt)
    await this.eventBus.publish(dataRequestUpdatedEvent(request.id, request.status))

    return { id: request.id, status: request.status }
  }
}
