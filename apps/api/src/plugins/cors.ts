// Path: apps/api/src/plugins/cors.ts
// CORS da API (ADR-007, Opção A): allowlist explícita via `CORS_ORIGIN`
// (origens separadas por vírgula) com credenciais habilitadas para o cookie de
// sessão cross-subdomínio. Nunca usa `*` com `Access-Control-Allow-Credentials`;
// sem allowlist configurada, nenhuma origem cross-origin é liberada (default seguro).
import cors from '@fastify/cors'
import type { FastifyInstance } from 'fastify'

/** Converte `CORS_ORIGIN` (ex.: "https://a.com,https://www.a.com") em allowlist. */
export function parseCorsAllowlist(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export async function corsPlugin(app: FastifyInstance): Promise<void> {
  const origins = parseCorsAllowlist(process.env.CORS_ORIGIN)

  await app.register(cors, {
    origin: origins.length > 0 ? origins : false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
}
