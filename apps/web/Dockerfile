# ---------------------------------------------------------------------------
# apps/web — imagem do portal Digimon TCG Brasil (Next.js 16, output: standalone)
# Build/run: Coolify ou EasyPanel (Build type: Dockerfile, Root: raiz do repo)
#
# Env vars em runtime (definir no painel):
#   DATABASE_URL  → Postgres (ex: postgresql://digimon:digimon@host:5432/digimon)
#   JWT_SECRET    → mínimo 32 caracteres (auth própria do @digimon/auth)
#   PORT          → porta do server standalone (default 3000)
#
# Migrations: aplicar uma vez com
#   pnpm --filter @digimon/database db:deploy
# (manualmente ou como pre-deploy no Coolify — a imagem não roda migrate).
#
# Notas:
#   - Multi-stage: deps (pnpm frozen-lockfile) → build (turbo --filter
#     @digimon/app-web) → runtime (só .next/standalone + static + public).
#   - O web DEPENDE dos workspace packages @digimon/* — por isso copiamos
#     todos os manifests (apps/web + packages/**) para o install resolver
#     os `workspace:*` (diferente da referência @diasbellazzi, sem workspace deps).
#   - Prisma 7 com driver adapter (@prisma/adapter-pg): sem engine binário no
#     runtime; o client gerado é commitado (packages/database/src/generated).
#   - Sem NEXT_PUBLIC_*: o backend são Route Handlers do próprio Next (same-origin).
#   - HOSTNAME=0.0.0.0: o standalone do Next escuta em todas as interfaces.
# ---------------------------------------------------------------------------

# ---------- Estágio 1: dependências ------------------------------------------
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@11.16.0 --activate
WORKDIR /app

# Manifests do monorepo (raiz + todos os workspaces) para o frozen-lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json turbo.json ./
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
RUN pnpm install --frozen-lockfile

# ---------- Estágio 2: build -------------------------------------------------
FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@11.16.0 --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# Páginas públicas são estáticas (dados via API client-side) — não precisa de
# DATABASE_URL no build. Se um dia houver SSG com banco, passar DATABASE_URL
# como ARG aqui.
RUN pnpm turbo build --filter=@digimon/app-web

# ---------- Estágio 3: runtime -----------------------------------------------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app

# Server standalone (server.js + node_modules mínimos)
COPY --from=build /app/apps/web/.next/standalone ./
# Assets estáticos (o standalone não inclui static nem public)
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]