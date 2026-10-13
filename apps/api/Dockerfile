# syntax=docker/dockerfile:1.7

# ---------------------------------------------------------------------------
# apps/api — imagem do backend Digimon TCG Brasil (Fastify + Prisma)
# Build/run: Coolify ou EasyPanel (Build type: Dockerfile, Root: raiz do repo,
#            Dockerfile Location: apps/api/Dockerfile)
#
# A API é um bundle ESM (esbuild → apps/api/dist/index.mjs) com as deps
# nativas/externas (fastify, pg, @prisma/*) resolvidas em runtime. O runtime
# mantém o monorepo Node completo porque o entrypoint precisa do Prisma CLI
# (`migrate deploy`) + tsx (seed) + `packages/database` (schema/migrations/seed).
#
# Env de runtime (definir no painel):
#   DATABASE_URL   → Postgres (ex: postgresql://digimon:****@postgres:5432/digimon)  [obrigatória]
#   JWT_SECRET     → mínimo 32 caracteres (auth própria do @digimon/auth)           [obrigatória]
#   CORS_ORIGIN    → allowlist do web, separada por vírgula (nunca "*")
#                    ex: https://digimoncardgamebrasil.com.br,https://www.digimoncardgamebrasil.com.br
#   COOKIE_DOMAIN  → domínio do cookie de sessão (default .digimoncardgamebrasil.com.br em produção)
#   SKIP_SEED      → "true" pula o seed (default: roda `seed.ts --only-if-empty`)
#   PORT           → porta HTTP (default 3022)
#   HOST           → interface de bind (default 0.0.0.0)
#
# Entrypoint (`docker-entrypoint.sh`):
#   prisma migrate deploy              → SEMPRE (nunca `migrate dev`)
#   tsx prisma/seed.ts --only-if-empty → só se SKIP_SEED != "true"
#   exec "$@"                          → inicia a API (CMD abaixo, sobrescrevível)
#
# Notas:
#   - Multi-stage: deps (pnpm frozen-lockfile) → build (bundle esbuild) →
#     runtime (Node + monorepo + packages/database + Prisma CLI/tsx).
#   - Prisma 7 com driver adapter (@prisma/adapter-pg): o client é gerado em
#     packages/database/src/generated e é COMMITADO — sem `prisma generate` no build.
#   - `exec` no entrypoint faz o node virar PID 1 → recebe SIGTERM/SIGINT e
#     dispara o shutdown limpo do Fastify (apps/api/src/index.ts).
# ---------------------------------------------------------------------------

# ---------- Estágio 1: dependências ------------------------------------------
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@11.16.0 --activate
WORKDIR /app

# Manifests do monorepo (raiz + todos os workspaces) para o frozen-lockfile.
# Diferente da referência @diasbellazzi: os `workspace:*` exigem os manifests de
# apps e packages/** para o pnpm resolver o grafo. `apps/web` também entra para o
# conjunto de projetos bater com o lockfile; o install é FILTRADO a
# `@digimon/app-api...` (só a API + suas deps de workspace) — o Next não entra.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/api-client/package.json ./packages/api-client/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/modules/auth/package.json ./packages/modules/auth/package.json
COPY packages/modules/users/package.json ./packages/modules/users/package.json
COPY packages/modules/content/package.json ./packages/modules/content/package.json
COPY packages/modules/comments/package.json ./packages/modules/comments/package.json
COPY packages/modules/cards/package.json ./packages/modules/cards/package.json
COPY packages/modules/decks/package.json ./packages/modules/decks/package.json
COPY packages/modules/tournaments/package.json ./packages/modules/tournaments/package.json
COPY packages/modules/ads/package.json ./packages/modules/ads/package.json
COPY packages/modules/privacy/package.json ./packages/modules/privacy/package.json
RUN pnpm install --frozen-lockfile --filter "@digimon/app-api..."

# ---------- Estágio 2: build (bundle esbuild) --------------------------------
FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@11.16.0 --activate
WORKDIR /app

# Workspace já instalado (todos os node_modules, incl. os symlinks do pnpm).
COPY --from=deps /app ./
# Código-fonte (respeita o .dockerignore — não sobrescreve node_modules nem dist).
COPY . .

# O install já foi feito no estágio `deps` (filtrado). Desliga a verificação de
# deps do pnpm antes de rodar scripts para o build ser hermético (sem 2º install).
ENV npm_config_verify_deps_before_run=false
RUN pnpm --filter @digimon/app-api build

# ---------- Estágio 3: runtime -----------------------------------------------
FROM node:22-alpine AS runtime

# Porta HTTP (build: --build-arg PORT=8080 | runtime: env PORT no painel).
ARG PORT=3022
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=$PORT
WORKDIR /app

# Node completo com o necessário ao entrypoint:
#  - node_modules raiz (store .pnpm + deps externas do bundle e do Prisma CLI)
#  - packages/** (inclui database: schema, migrations, seed, generated, node_modules)
#  - apps/api (bundle dist + node_modules para os externos fastify/pg/@prisma/*)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/api ./apps/api

# Prisma CLI + tsx ficam no `.bin` de packages/database (devDeps do pacote).
ENV PATH="/app/packages/database/node_modules/.bin:${PATH}"

COPY apps/api/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE $PORT

# ENTRYPOINT roda migrate + seed e depois `exec "$@"`. O CMD é sobrescrevível
# no painel do Coolify/EasyPanel (ex.: comando de debug).
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "apps/api/dist/index.mjs"]
