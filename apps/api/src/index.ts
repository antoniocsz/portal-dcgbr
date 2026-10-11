import { buildApp } from './app'

const HOST = process.env.HOST ?? '0.0.0.0'
const PORT = Number(process.env.PORT ?? 3001)

async function main(): Promise<void> {
  const app = buildApp()

  try {
    await app.listen({ host: HOST, port: PORT })
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }

  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.once(signal, () => {
      app.log.info(`received ${signal}, shutting down`)
      void app.close().then(() => process.exit(0))
    })
  }
}

void main()
