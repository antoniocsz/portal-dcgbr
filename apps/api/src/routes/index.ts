// Path: apps/api/src/routes/index.ts
// Registro central de rotas da API: um plugin Fastify por módulo (bounded context).
// Cada plugin declara os caminhos completos (ex.: /auth/login, /admin/decks), então
// o registro é feito sem prefixo — evita colisão entre módulos que compartilham
// segmentos (decks expõe /decks e /admin/decks).
// As tasks 37–42 preenchem os stubs correspondentes sem editar este arquivo.
import type { FastifyPluginAsync } from 'fastify'
import { authRoutes } from './auth'
import { usersRoutes } from './users'
import { contentRoutes } from './content'
import { settingsRoutes } from './settings'
import { commentsRoutes } from './comments'
import { cardsRoutes } from './cards'
import { decksRoutes } from './decks'
import { communityDecksRoutes } from './community-decks'
import { tournamentsRoutes } from './tournaments'
import { adsRoutes } from './ads'
import { privacyRoutes } from './privacy'

export const routesPlugin: FastifyPluginAsync = async (app) => {
  await app.register(authRoutes)
  await app.register(usersRoutes)
  await app.register(contentRoutes)
  await app.register(settingsRoutes)
  await app.register(commentsRoutes)
  await app.register(cardsRoutes)
  await app.register(decksRoutes)
  await app.register(communityDecksRoutes)
  await app.register(tournamentsRoutes)
  await app.register(adsRoutes)
  await app.register(privacyRoutes)
}
