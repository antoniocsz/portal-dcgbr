import Fastify, { type FastifyInstance } from 'fastify'
import { corsPlugin } from './plugins/cors'
import { errorHandlerPlugin } from './plugins/error-handler'
import { routesPlugin } from './routes'

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true
  })

  // O handler de erro e as rotas precisam viver no MESMO escopo: sem
  // `fastify-plugin`, um plugin registrado via `register` encapsula o
  // `setErrorHandler` e os escopos irmãos não o herdam (cairiam no handler
  // default do Fastify, quebrando o contrato `{ error: { code, message, details } }`).
  app.register(async (instance) => {
    await corsPlugin(instance)
    await errorHandlerPlugin(instance)
    await instance.register(routesPlugin)
    instance.get('/health', async () => ({ status: 'ok' }))
  })

  return app
}
