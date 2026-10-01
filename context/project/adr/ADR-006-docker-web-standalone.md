# ADR-006: Deploy do web via Docker (Next.js standalone) no Coolify

**Data:** 2026-10-01
**Status:** accepted

## Contexto

O portal precisa de deploy simples e reprodutível no Coolify (ADR-001: portal
único). O `apps/web` é um monorepo com workspace packages `@digimon/*`
(auth, users, content, cards, decks, tournaments, comments, database), auth
própria JWT (ADR-002) e Prisma 7 com driver adapter (sem engine binário). As
páginas públicas são estáticas (SSG sem banco — dados via API client-side).

## Decisão

Imagem Docker multi-stage em `apps/web/Dockerfile`, baseada no padrão
`@diasbellazzi` (node:22-alpine + pnpm frozen-lockfile + turbo filter):

1. **deps** — copia todos os manifests do monorepo (raiz + apps/web +
   packages/**) e roda `pnpm install --frozen-lockfile`.
2. **build** — `pnpm turbo build --filter=@digimon/app-web` com
   `output: 'standalone'` no next.config.ts.
3. **runtime** — apenas `.next/standalone` + `.next/static` + `public`
   (sem node_modules completo), `node apps/web/server.js` com
   `HOSTNAME=0.0.0.0`.

Env de runtime no painel: `DATABASE_URL`, `JWT_SECRET`, `PORT` (default 3000;
configurável via ARG `--build-arg PORT=xxxx` no build ou sobrescrito por env
runtime — o `server.js` do standalone lê `process.env.PORT` ao subir, sem
rebuild). Migrations aplicadas fora da imagem
(`pnpm --filter @digimon/database db:deploy` — pre-deploy/manual), mantendo a
imagem imutável.

## Consequências positivas

- Imagem pequena (só standalone + static + public)
- Sem `NEXT_PUBLIC_*`: Route Handlers são same-origin (sem variável pública de API)
- Sem engine binário do Prisma no runtime (driver adapter `@prisma/adapter-pg`)
- Client Prisma commitado → build sem `prisma generate`
- Build sem banco: páginas públicas são estáticas

## Trade-offs aceitos

- **PnP/install mais lento no deps stage** (todos os workspaces copiados) —
  necessário para resolver `workspace:*`
- **Migrations fora da imagem** — exige passo extra no deploy (pre-deploy)
- **Alpine (musl)** — binários nativos (sharp) precisam de build para musl;
  pnpm `allowBuilds` cobre os postinstall (sharp/esbuild/prisma)

## Alternativas descartadas

- **[Dockerfile só com apps/web (como @diasbellazzi)]:** web depende de
  workspace packages — install sem os manifests falha
- **[Full node_modules no runtime]:** imagem grande e desnecessária
- **[prisma generate no build]:** client já é commitado em
  `packages/database/src/generated` — gerar de novo só adiciona tempo