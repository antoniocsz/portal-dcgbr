// Path: apps/api/src/plugins/error-handler.ts
// Handler global de erros da API: traduz AppError → HTTP com o mesmo contrato
// de resposta do web ({ error: { code, message, details } }). Erros inesperados
// (5xx) são logados e têm o detalhe oculto em produção; sem stack trace na resposta.
import type { FastifyError, FastifyInstance } from 'fastify'
import { AppError } from '@digimon/contracts'

const isProduction = process.env.NODE_ENV === 'production'

export async function errorHandlerPlugin(app: FastifyInstance): Promise<void> {
  app.setErrorHandler<FastifyError | AppError>((error, request, reply) => {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          details: (error as { details?: unknown }).details
        }
      })
      return
    }

    const statusCode = error.statusCode ?? 500

    if (statusCode >= 500) {
      request.log.error(error)
      reply.status(statusCode).send({
        error: {
          code: 'INTERNAL_ERROR',
          message: isProduction ? 'Erro interno do servidor' : error.message
        }
      })
      return
    }

    reply.status(statusCode).send({
      error: { code: error.code ?? 'Error', message: error.message }
    })
  })
}
