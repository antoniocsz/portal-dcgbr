#!/bin/sh
# Path: apps/api/docker-entrypoint.sh
# Entrypoint do container da API (ADR-007): aplica migrations e roda o seed
# guardado ANTES de subir o servidor Fastify. Usado como ENTRYPOINT no
# apps/api/Dockerfile; o CMD (sobrescrevível no painel) é repassado via "$@".
#
# Ordem fixa:
#   1. `prisma migrate deploy`  → SEMPRE (nunca `migrate dev` em produção)
#   2. `tsx prisma/seed.ts --only-if-empty` → só se SKIP_SEED != "true"
#   3. `exec "$@"`              → inicia a API (default: node dist/index.mjs)
#
# Env vars lidas aqui / pelo processo:
#   DATABASE_URL   → Postgres (obrigatória; usada pelo prisma.config.ts)
#   SKIP_SEED      → "true" pula o seed (default: roda o seed guardado)
#   ADMIN_EMAIL / ADMIN_PASSWORD → admin criado pelo seed quando vazio
#   JWT_SECRET / CORS_ORIGIN / COOKIE_DOMAIN / HOST / PORT → lidas pela API
#
# `cd /app/packages/database` para o Prisma CLI encontrar o prisma.config.ts
# (schema + migrations) e o tsx resolver o seed. O `.bin` do pacote está no
# PATH (definido no Dockerfile) — daí chamarmos `prisma`/`tsx` diretos.

set -e

cd /app/packages/database

echo "[entrypoint] aplicando migrations (prisma migrate deploy)"
prisma migrate deploy

if [ "${SKIP_SEED:-}" = "true" ]; then
  echo "[entrypoint] seed pulado (SKIP_SEED=true)"
else
  echo "[entrypoint] rodando seed guardado (--only-if-empty)"
  tsx prisma/seed.ts --only-if-empty
fi

cd /app

echo "[entrypoint] iniciando API: $*"
# `exec` → o node assume PID 1 e recebe SIGTERM/SIGINT (shutdown limpo do
# Fastify, ver apps/api/src/index.ts).
exec "$@"
