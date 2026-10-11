# ADR-007: Backend separado do frontend (API em `apps/api`)

**Data:** 2026-10-09
**Status:** accepted

## Contexto

O ADR-001 decidiu um **portal único em Next.js com o backend integrado** (Route
Handlers + Server Actions no mesmo app, mesmo domínio). Na prática, todo o backend
vive em `apps/web/src/app/api/**` (~60 arquivos), composto com Prisma via
`apps/web/src/lib/server/**` (composition root / DIP).

Três forças motivaram reverter essa parte:

1. **Migrations/seed não rodam no runtime atual.** O web é uma imagem Next
   `standalone` (ADR-006): cópia só `.next/standalone` + `static` + `public`, sem
   `pnpm`/`prisma`/`migrations`. Isso obriga migrate/seed a rodar **fora** da
   imagem (manual ou CI). O **pre-deploy do Coolify não serve**: roda no container
   *atual* (que não tem o runner) e é **pulado no 1º deploy**. O padrão do projeto
   `diasbellazzi` — entrypoint com `prisma migrate deploy` + seed guardado — exige
   um runtime **Node completo** com o monorepo.
2. **Acoplamento:** handlers, composition root e UI no mesmo app. Separar cria uma
   fronteira explícita web↔API.
3. **API como produto:** expor a API para consumidores externos (mobile nativo /
   integrações futuras) — objetivo declarado do dono do produto.

A costura HTTP **já existe**: as features falam `fetch` com **URL relativa**
(`features/*/model/api.ts`) e os handlers só dependem de `@digimon/*` e
`@digimon/database`. É mover, não reescrever.

## Decisão

Separar backend e frontend:

1. **`apps/api` (NOVO)** — servidor **Fastify** (Node). Passa a ser o dono dos
   Route Handlers hoje em `apps/web/src/app/api/**` e do composition root
   (`apps/web/src/lib/server/**`), consumindo os use cases de `packages/modules/*`
   e a persistência de `packages/database`.
2. **`apps/web`** — vira **frontend puro** (Next.js). Deixa de importar
   `@digimon/database` e de expor `/api/**`. Continua standalone (ADR-006), agora
   **sem `DATABASE_URL`**.
3. **Exposição da API — subdomínio `api.digimoncardgamebrasil.com.br`** (a API é
   produto público):
   - **CORS** na API: allowlist do domínio do web
     (`https://digimoncardgamebrasil.com.br` + `www`),
     `Access-Control-Allow-Credentials: true`, preflight `OPTIONS` (métodos/headers).
   - **Cookies de sessão** compartilhados entre subdomínios: `Domain=.digimoncardgamebrasil.com.br`,
     `httpOnly`, `Secure`, `SameSite=Lax` (subdomínios são *same-site* → Lax
     preserva a proteção cross-site).
4. **Cliente HTTP:** `packages/api-client` deixa de ser código morto e vira o
   cliente único do web. `baseUrl` = URL pública da API no browser /
   endereço **interno** (`http://api:3001`) no SSR; `credentials: 'include'`.
   Remover o `tenantId` herdado do template `@saas`.
5. **Migrations + seed no entrypoint da API** (padrão `diasbellazzi`):
   `apps/api/docker-entrypoint.sh` roda `prisma migrate deploy` (**sempre** — nunca
   `migrate dev`) e `tsx prisma/seed.ts --only-if-empty` (desligável com
   `SKIP_SEED=true`), depois `exec node dist/index.js`. O runtime da API é Node
   completo (monorepo + `packages/database` com prisma/migrations/seed).
   - Novo guard **`--only-if-empty`** no `seed.ts`: se o banco já estiver populado,
     loga e sai 0 (bootstrap seguro — nunca sobrescreve banco real; hoje o seed só
     pula por e-mail do admin).
6. **Estratégia de migração:** **strangler** — mover **módulo a módulo**, mantendo
   o portal funcionando em cada passo.
7. **Dados no web:** manter o fetch **client-side** atual (páginas estáticas). SSR
   com dados pode vir depois, se necessário.

**Impacto em ADRs existentes:** reverte **parcialmente** o **ADR-001** (o "backend
integrado no Next" deixa de valer; "portal único / SEO-first / domínio único"
segue — o web continua um app só, público + admin). **Ajusta o ADR-006** (o runtime
do web deixa de acessar banco; nasce o runtime Node da API).

## Consequências positivas

- **migrate + seed automatizados no deploy** — resolve o problema original (seed
  em produção) sem depender de CI nem de pre-deploy do Coolify.
- **Fronteira web↔API explícita**; `@digimon/api-client` passa a ter uso real.
- **Deploy e escala independentes**; API reutilizável por terceiros.
- **Web mais leve** (sem Prisma/módulos server) e com **falha isolada** — API fora
  do ar não derruba o HTML estático do portal.

## Trade-offs aceitos

- **CORS + `credentials`** e `Domain` nos cookies (custo da Opção A — API em
  subdomínio).
- **Dois deploys** e coordenação de migrations (centralizada no entrypoint da API).
- **Superfície de CSRF** (cookie cross-origin): mitigada por `SameSite=Lax`;
  reavaliar token CSRF nos endpoints mutáveis.
- **Refactor de ~60 handlers** + composition root + reescrita do registro de rotas.
- **Negócio:** API pública exige versionamento/`noindex` (`X-Robots-Tag`) e
  cuidado com superfície de exposição.

## Alternativas descartadas

- **Manter o portal único + CI para migrate/seed:** resolve só o seed, não a
  fronteira nem a API pública — e o objetivo declarado é ter a API separada.
- **Opção B — API no mesmo domínio via path `/api/*` (Traefik `PathPrefix` ou
  `next.config` rewrites):** mais barato (sem CORS/`credentials`/`Domain`, front
  intacto), porém **não expõe a API como produto**. Descartada por escolha
  explícita do dono (API pública).
- **Container/job de migrate separado (sem separar o app):** menor churn, mas
  mantém o acoplamento e não entrega a API própria.
- **Big-bang:** risco alto; preferido o **strangler**.

## Plano de migração (fases)

> Fases podem ser fatiadas por módulo (strangler). Cada fase mantém o portal no ar.

1. **Fundação** — criar `apps/api` (Fastify) + workspace/turbo config; mover o
   composition root (`apps/web/src/lib/server/**`) e o `packages/database` bind.
2. **Handlers** — mover `apps/web/src/app/api/**` → `apps/api` (registro de rotas
   Fastify), por módulo (auth → users → content → comments → cards → decks →
   tournaments → settings).
3. **Auth/topologia** — CORS + `Domain` no cookie + `api-client` com
   `credentials: 'include'`; validar login/refresh/me cross-origin.
4. **Web client** — `features/*/model/api.ts` → `@digimon/api-client` (`baseUrl`
   de env; interno no SSR).
5. **Migrations/seed** — `seed.ts --only-if-empty` + `apps/api/docker-entrypoint.sh`
   + `apps/api/Dockerfile` (Node completo); enxugar `apps/web/Dockerfile` (sem banco).
6. **Deploy** — subdomínio `api.` + SSL no Coolify; envs (`DATABASE_URL`,
   `JWT_SECRET`, `CORS_ORIGIN`); smoke test.
7. **Dados/SEO** — validar páginas públicas/admin; avaliar SSR/ISR com dados depois.

## Consequências para docs

- `context/project/stack.md` — seções Frontend/Backend/Infra atualizadas.
- `context/project/overview.md` — stack e princípio "portal único" ajustados.
- `context/project/deploy.md` — passará a descrever 2 apps (API + web) e o
  entrypoint de migrate/seed (task futura, não neste ADR).
