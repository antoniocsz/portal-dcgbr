# ---------------------------------------------------------------------------
# apps/web — imagem do portal Digimon TCG Brasil (Next.js 16, output: standalone)
# Build/run: Coolify ou EasyPanel (Build type: Dockerfile, Root: raiz do repo,
#            Dockerfile Location: apps/web/Dockerfile)
#
# Frontend puro (ADR-007): o web NÃO acessa banco nem expõe /api/** — fala com a
# API separada (apps/api) via @digimon/api-client. A imagem não precisa de
# DATABASE_URL/Prisma (nem no build, nem no runtime).
#
# Env vars (definir no painel):
#   JWT_SECRET          → mínimo 32 caracteres (valida a sessão do admin no
#                         servidor; precisa ser O MESMO segredo da API)
#   API_INTERNAL_URL    → endereço interno da API na rede do host (SSR/middleware),
#                         ex: http://api:3001
#   NEXT_PUBLIC_API_URL → URL pública da API usada no browser. Embutida em BUILD
#                         time (marcar "available at buildtime" no Coolify)
#   PORT                → porta do server standalone (default 3000)
#
# Notas:
#   - Multi-stage: deps (pnpm frozen-lockfile) → build (turbo --filter
#     @digimon/app-web) → runtime (só .next/standalone + static + public).
#   - Só os manifests do grafo do web entram no install: apps/web + as deps de
#     workspace que ele realmente consome (api-client, contracts, database,
#     modules/auth, modules/users). Os demais módulos (cards, comments, content,
#     decks, tournaments) e a API ficam de fora.
#   - Sem banco no build: as páginas são estáticas e os dados vêm da API no
#     client-side; `next build` não abre conexão com o Postgres.
#   - HOSTNAME=0.0.0.0: o standalone do Next escuta em todas as interfaces.
# ---------------------------------------------------------------------------

# ---------- Estágio 1: dependências ------------------------------------------
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@11.16.0 --activate
WORKDIR /app

# Manifests do grafo do web (raiz + apps/web + workspace deps). `@digimon/database`
# entra porque `@digimon/auth`/`@digimon/users` o declaram como dependência
# (usam os tipos do PrismaClient); os demais pacotes não são necessários ao web.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json turbo.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/api-client/package.json ./packages/api-client/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/modules/auth/package.json ./packages/modules/auth/package.json
COPY packages/modules/users/package.json ./packages/modules/users/package.json
RUN pnpm install --frozen-lockfile

# ---------- Estágio 2: build -------------------------------------------------
FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@11.16.0 --activate
WORKDIR /app

# Workspace já instalado (todos os node_modules/symlinks do pnpm). O build/standalone
# do Next resolve `apps/web/node_modules/.bin/next` por aqui.
COPY --from=deps /app ./
# Código-fonte (o .dockerignore preserva os node_modules acima).
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# URL pública da API usada no browser. O Next inlina NEXT_PUBLIC_* em BUILD time,
# então o valor precisa chegar ao `next build` via --build-arg
# (no Coolify: marcar a env como "available at buildtime").
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Sem DATABASE_URL: o build não toca no banco.
RUN pnpm turbo build --filter=@digimon/app-web

# ---------- Estágio 3: runtime -----------------------------------------------
FROM node:22-alpine AS runtime
# Porta do server standalone. Configurável:
#   - build:  --build-arg PORT=8080   (muda EXPOSE e o default do ENV)
#   - runtime: env PORT no Coolify     (sobrescreve sem rebuild — o server.js
#                                       lê process.env.PORT ao subir)
ARG PORT=3000
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=$PORT \
    HOSTNAME=0.0.0.0
WORKDIR /app

# Server standalone (server.js + node_modules mínimos)
COPY --from=build /app/apps/web/.next/standalone ./
# Assets estáticos (o standalone não inclui static nem public)
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public

EXPOSE $PORT

CMD ["node", "apps/web/server.js"]
