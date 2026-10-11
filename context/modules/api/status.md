# @digimon/app-api — Status

## Fase 1 — Scaffold do `apps/api` (task 34-backend-scaffold-apps-api)
- [x] App Node + Fastify em `apps/api` (ADR-007), sem rotas de domínio
- [x] `GET /health` → 200 `{ status: 'ok' }` (validado via `inject` e via `listen` real)
- [x] `HOST`/`PORT` por env (default `0.0.0.0:3001`)
- [x] Bootstrap com logging (`logger: true`) e shutdown limpo (SIGTERM/SIGINT → `app.close()`)
- [x] Plugin de error handler global (`src/plugins/error-handler.ts`): 5xx loga e oculta detalhe em produção; 4xx devolve `code`/`message`
- [x] Scripts: `dev` (tsx watch), `build` (tsc), `start` (node dist/index.js), `typecheck`, `lint`
- [x] `@digimon/app-api` no workspace pnpm; Turbo reconhece o app
- [x] Typecheck: `pnpm turbo typecheck --filter=@digimon/app-api` — ok
- [x] Lint: `pnpm turbo lint --filter=@digimon/app-api` — 0 erros
- [x] Build: `pnpm turbo build --filter=@digimon/app-api` — ok (emite `dist/`)

## Pendências / próximos passos (fases do ADR-007)
- [x] **task 35** — composition root (`container.ts` + `http/**` + `plugins/**`) portado para a API
- [x] **task 36–42** — portar handlers de auth → users → content → comments → cards → decks → tournaments
- [x] **task 43** — CORS (allowlist + credentials) + cookies com `Domain` compartilhado
- [x] **task 47** — Dockerfile + `docker-entrypoint.sh` (migrate deploy + seed `--only-if-empty`)
- [x] **Atenção (build) resolvida na task 35:** `build` passou a **bundle esbuild ESM**
  (`dist/index.mjs`, externals `fastify`/`pg`/`@prisma/*`) — o entrypoint roda esse bundle.

## Handoff (task 34)
- **Feito:** scaffold funcional do `apps/api` (Fastify) — bootstrap, plugin de error handler,
  `GET /health`, env `HOST`/`PORT`, scripts e config TS. Nenhuma rota/lógica de domínio.
- **Arquivos:** `apps/api/{package.json,tsconfig.json,.env.example,src/index.ts,src/app.ts,src/plugins/error-handler.ts}`,
  `context/modules/api/status.md`, `pnpm-lock.yaml`.
- **Deps:** runtime `fastify@^5.12.5`; dev `tsx@^4.23.15`, `typescript@^6.0.3`, `@types/node@^22.20.4`.
- **Decisões:** (1) saída **CommonJS** via `module/moduleResolution: NodeNext` (sem `"type": "module"`)
  para `node dist/index.js` rodar direto, sem exigir extensões `.js` nos imports. (2) Error handler
  é genérico (self-contained), pois `@digimon/contracts`/`DomainError` estão fora do escopo deste
  scaffold — a tradução `DomainError/NotFound/Forbidden` entra junto do composition root (task 35).
  (3) `setErrorHandler<FastifyError>` porque Fastify 5.12 tipa o erro como `unknown` por default.
  (4) `turbo.json` **não** precisou mudar (sem env de build).
- **Fora do escopo (reportar):** nenhum arquivo do `apps/web`, de `packages/**` ou de rotas de
  domínio foi tocado.

## Fase 2 — Composition root + camada HTTP na API (task 35-backend-mover-composition-root)
- [x] `apps/api/src/container.ts` — composition root (DIP), porte de `apps/web/src/lib/server/container.ts`
- [x] `apps/api/src/http/cookies.ts` — helpers de cookie httpOnly (read/attach/clear); topologia `Domain` fica na task 43
- [x] `apps/api/src/http/site-gate.ts` — get/set do modo do site (cache in-process)
- [x] `apps/api/src/http/user-account-adapter.ts` — adapter User → UserAccount (DIP)
- [x] `apps/api/src/plugins/auth.ts` — hook de sessão (cookie/Bearer), `authenticate` + `requireRoleHook`
- [x] `apps/api/src/plugins/rate-limit.ts` — rate limit por IP (reuso `InMemoryRateLimiter`)
- [x] `apps/api/src/plugins/error-handler.ts` — erro uniforme (`AppError` → HTTP `{ error: { code, message, details } }`)
- [x] Build: esbuild bundle ESM (deps nativas/externas: fastify, pg, @prisma/*)
- [x] Typecheck + lint + build `@digimon/app-api` ok
- [x] Strangler: `apps/web/src/lib/server/**` **mantido** (o web segue funcionando)

## Handoff (task 35)
- **Feito:** composition root + camada HTTP portados para `apps/api` (container, cookies, site-gate, user-account-adapter, plugins auth/rate-limit/error-handler). Nenhuma lógica de domínio duplicada.
- **Arquivos:** `apps/api/src/{container.ts,http/**,plugins/**}`, `apps/api/package.json`, `pnpm-lock.yaml`.
- **Deps:** `@digimon/{auth,contracts,database,users}`, `@prisma/adapter-pg`, `@prisma/client`, `pg`; dev `esbuild`.
- **Decisões:** (1) `build` migrado para **esbuild** (bundle ESM, `dist/index.mjs`) com `fastify`/`pg`/`@prisma/*` como externos — resolve a pendência de `tsc` + `workspace src/index.ts` registrada na task 34. (2) Hooks de auth/rate-limit são `preHandler` reutilizáveis (registro por rota nas tasks 36+). (3) Cookie mantém o comportamento atual do web (sem `Domain`) — a topologia cross-origin entra na task 43.
- **Fora do escopo (reportar):** `apps/web/src/lib/server/**` intocado (strangler).

## Fase 3 — Registro de rotas + rotas de auth (task 36-backend-auth-routes)
- [x] `apps/api/src/routes/index.ts` — plugin central que registra um plugin por módulo (sem prefixo; cada plugin declara caminhos completos)
- [x] Stubs vazios por módulo: `users.ts`, `content.ts`, `settings.ts`, `comments.ts`, `cards.ts`, `decks.ts`, `tournaments.ts` (destravam as tasks 37–42)
- [x] `apps/api/src/routes/auth.ts` — 7 rotas portadas de `apps/web/src/app/api/auth/**` (contratos JSON idênticos)
- [x] Registro do `routesPlugin` em `apps/api/src/app.ts`
- [x] **Fix de wiring (app.ts):** handler de erro + rotas no mesmo escopo — `setErrorHandler` dentro de `app.register` é encapsulado (sem `fastify-plugin`) e escopos irmãos caíam no handler default do Fastify
- [x] Typecheck + lint + build `@digimon/app-api` ok; `/health` 200
- [x] Smoke via `app.inject`: register 201 + 2 cookies, me 200, refresh 200 + 2 cookies, logout 200 `{ok:true}` + cookies limpos; erros `{ error: { code, message, details } }`; login inválido 401 `UNAUTHORIZED`
- [x] Strangler: `apps/web/src/app/api/auth/**` e `apps/web/src/lib/server/**` **mantidos** (web segue funcionando)

## Handoff (task 36)
- **Feito:** registro de rotas da API (index + 8 plugins por módulo) e porte das rotas de auth (login/logout/refresh/register/forgot-password/reset-password/me) reusando os use cases de `@digimon/auth` e `@digimon/users`. Contratos JSON e erros idênticos ao web; rate limit de register preservado (`registerRateLimit` 5/15min).
- **Arquivos:** `apps/api/src/routes/**` (index + 8 arquivos), `apps/api/src/app.ts`, `context/modules/api/status.md`, `context/modules/auth/status.md`.
- **Deps:** nenhuma adicionada (helpers de cookie leem/escrevem via header manualmente — `@fastify/cookie`/`@fastify/cors` não foram necessários; CORS/cookie `Domain` é a task 43).
- **Decisões:** (1) plugins de módulo registrados **sem prefixo** — cada um declara o caminho completo; necessário porque `decks` expõe `/decks` e `/admin/decks` (task 41) e prefixar quebraria o segundo. (2) `GET /auth/me` lê apenas o cookie `access_token` (paridade exata com o web) e responde `{ user: null }` sem auth. (3) **Correção de escopo do error handler em `app.ts`**: como `errorHandlerPlugin` não usa `fastify-plugin`, registrá-lo com `app.register` encapsulava o `setErrorHandler`; handler e rotas passaram a viver no mesmo escopo. Sem essa correção, as rotas devolviam o erro default do Fastify (contrato divergente do web).
- **Fora do escopo (reportar):** `apps/web/**` intocado; `plugins/error-handler.ts` intocado (a correção ficou só em `app.ts`).

## Fase 4 — Topologia de auth cross-origin: CORS + cookie `Domain` (task 43-backend-cors-cookie-domain)
- [x] `apps/api/src/plugins/cors.ts` (NOVO) — `@fastify/cors` com allowlist de `CORS_ORIGIN`,
      `credentials: true`, métodos e headers explícitos; sem allowlist → nenhuma origem liberada (nunca `*`)
- [x] `@fastify/cors@^11.3.1` adicionada a `apps/api` (dep runtime)
- [x] `apps/api/src/http/cookies.ts` — `Domain` compartilhado (`sessionCookieDomain()`): `COOKIE_DOMAIN`
      ou default `.digimoncardgamebrasil.com.br` em produção; `httpOnly`/`Secure`/`SameSite=Lax`/`path=/` mantidos
- [x] `apps/api/src/app.ts` — `corsPlugin` registrado antes do handler de erro e das rotas
- [x] `apps/api/.env.example` — documenta `CORS_ORIGIN` e `COOKIE_DOMAIN`
- [x] Typecheck + lint + build `@digimon/app-api` ok
- [x] Smoke `app.inject`: preflight `OPTIONS /auth/login` → 204 com `Access-Control-Allow-Origin`
      e `Access-Control-Allow-Credentials: true`; origem fora da allowlist sem header; login 200 + cookies
      com `Domain=.digimoncardgamebrasil.com.br`, `me` 200 e `refresh` 200 (com DB local)
- [x] Strangler: `apps/web/**` intocado

## Handoff (task 43)
- **Feito:** topologia de auth cross-origin da Opção A do ADR-007 — plugin de CORS com allowlist
  (`CORS_ORIGIN`, nunca `*` com credenciais) + cookie de sessão com `Domain` compartilhado entre
  `digimoncardgamebrasil.com.br` e `api.digimoncardgamebrasil.com.br`.
- **Arquivos:** `apps/api/src/plugins/cors.ts` (novo), `apps/api/src/http/cookies.ts`, `apps/api/src/app.ts`,
  `apps/api/.env.example`, `apps/api/package.json`, `pnpm-lock.yaml`, `context/modules/api/status.md`.
- **Deps:** `@fastify/cors@^11.3.1` (adicionada com aprovação prévia; `pnpm install` ok).
- **Decisões:** (1) allowlist configurável por env e default **seguro** — `CORS_ORIGIN` vazio desabilita
  CORS (nunca reflete origem arbitrária). (2) `Domain` do cookie derivado de `sessionCookieDomain()`:
  `COOKIE_DOMAIN` (override) → default `.digimoncardgamebrasil.com.br` em `NODE_ENV=production` → sem
  `Domain` em dev (localhost). (3) `corsPlugin` é chamado direto em `buildApp` (mesmo padrão do
  `errorHandlerPlugin`), antes das rotas, para os hooks de CORS valerem no escopo que hospeda as rotas.
- **Fora do escopo (reportar):** `apps/web/**` intocado; `app.ts` e `package.json`/`pnpm-lock.yaml` foram
  tocados além dos 4 arquivos do `## Escopo` — necessários, respectivamente, para registrar o plugin e
  adicionar a dep pré-aprovada (ambos já constavam no `## Baseline (git)` da task).

## Fase 5 — Imagem da API: Dockerfile + entrypoint migrate/seed (task 47-infra-api-dockerfile-entrypoint)
- [x] `apps/api/Dockerfile` (NOVO) — multi-stage: `deps` (pnpm frozen-lockfile **filtrado** a
      `@digimon/app-api...`) → `build` (bundle esbuild `dist/index.mjs`) → `runtime` Node 22
      (node_modules + `packages/**` + `apps/api`)
- [x] `apps/api/docker-entrypoint.sh` (NOVO, `set -e`): `cd /app/packages/database` →
      `prisma migrate deploy` (**sempre**) → `tsx prisma/seed.ts --only-if-empty` (se `SKIP_SEED != true`)
      → `exec "$@"` (default `node apps/api/dist/index.mjs`, `CMD` sobrescrevível no painel)
- [x] Runtime completo para o entrypoint: Prisma CLI + tsx (via `PATH` do `.bin` de
      `packages/database`) + `prisma/schema.prisma`, `migrations/**`, `seed.ts`, `generated/`
- [x] Envs documentadas no Dockerfile/entrypoint: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`,
      `COOKIE_DOMAIN`, `SKIP_SEED`, `PORT`, `HOST`
- [x] `.dockerignore` validado (já cobre `node_modules`/`dist`/`.git`/`.env`) — sem alteração
- [x] Build real: `docker build -f apps/api/Dockerfile .` — **ok** (~595MB; Next **não** entra)
- [x] Runtime validado com Postgres 16: `migrate deploy` aplica 6 migrations; seed cria o admin;
      `GET /health` → 200; restart → `Seed ignorado (banco já populado)`; `SKIP_SEED=true` → seed pulado;
      `docker stop` → `received SIGTERM, shutting down` (exit 0)
- [x] `pnpm harness check --barrel --db` — ok

## Handoff (task 47)
- **Feito:** imagem da API (Fastify) com migrate/seed no entrypoint, padrão do ADR-007 (inspirado em
  `diasbellazzi`, adaptado ao bundling esbuild + monorepo pnpm).
- **Arquivos:** `apps/api/Dockerfile` (novo), `apps/api/docker-entrypoint.sh` (novo),
  `context/modules/api/status.md`, `context/project/deploy.md`.
- **Deps:** nenhuma nova (usa o `build` esbuild existente; `prisma`/`tsx` já são devDeps de
  `@digimon/database`).
- **Decisões:** (1) `deps` copia **todos** os manifests (incl. `apps/web`) para o grafo bater com o
  lockfile e instala com `--filter "@digimon/app-api..."` — evita o 2º `pnpm install` no `build` e
  mantém o Next fora da imagem (958MB → 595MB); `npm_config_verify_deps_before_run=false` no build
  torna o passo hermético. (2) `ENTRYPOINT` faz migrate+seed e `exec "$@"`; `CMD` default
  `["node","apps/api/dist/index.mjs"]` — sobrescrevível no painel. (3) Prisma CLI/tsx resolvidos via
  `PATH` para o `.bin` de `packages/database` (sem corepack no runtime). (4) `exec` no entrypoint dá
  ao node PID 1 → shutdown limpo. (5) Prisma 7 + adapter-pg: client gerado é commitado, sem
  `prisma generate` no build.
- **Validação:** `docker build` real + smoke E2E com Postgres 16 (migrate + seed + guard + SKIP_SEED +
  `/health` 200 + SIGTERM). Recursos de teste removidos ao final.
- **Fora do escopo (reportar):** `apps/web/**` intocado; `.dockerignore` sem alteração (já adequado).

## Fase 6 — Factories de composição por módulo no `container.ts` (task 52-backend-container-module-factories)
- [x] `apps/api/src/container.ts` — factories `contentDeps()`, `commentsDeps()`, `cardsDeps()`,
      `decksDeps()`, `tournamentsDeps()` (mesmo padrão de `authDeps()`/`usersDeps()`)
- [x] Rotas `content/comments/cards/decks/tournaments` consomem as factories (sem composição inline)
- [x] `PrismaCardReferenceValidator` movido do arquivo de rota `decks.ts` para o `container.ts`
- [x] Contratos HTTP inalterados (nenhuma lógica de domínio ou rota alterada)
- [x] Typecheck + lint + build `@digimon/app-api` ok
- [x] Smoke `app.inject`: `/health` 200; `/cards` alcança o use case (`ListCardsUseCase`) — 500
      apenas por ausência de DB local (ECONNREFUSED), comprovando o wiring das factories

## Handoff (task 52)
- **Feito:** composição (repositórios Prisma + `eventBus`) extraída dos arquivos de rota para o
  composition root (`container.ts`), em factories por módulo: `contentDeps()` → `{ posts, postRepo }`,
  `commentsDeps()`/`cardsDeps()`/`decksDeps()`/`tournamentsDeps()` → conjunto de use cases do módulo.
  Eliminado o débito das tasks 38–42 (composição inline). Sem mudança de contrato HTTP.
- **Arquivos:** `apps/api/src/container.ts`, `apps/api/src/routes/{content,comments,cards,decks,tournaments}.ts`,
  `context/modules/api/status.md`.
- **Deps:** nenhuma.
- **Decisões:** (1) factories retornam o **conjunto composto de use cases** (como o `_lib/container.ts` do web
  e o `commentsDeps()` que já existia local), centralizando a montagem; `contentDeps()` também expõe o
  `postRepo` porque a rota o usa diretamente (`getEditorialPostById`). (2) `content/cards/decks/tournaments`
  chamam a factory **uma vez no módulo** (comportamento anterior preservado); `comments` continua chamando
  **por requisição** (paridade exata com o `commentsDeps()` local anterior). (3) `PrismaCardReferenceValidator`
  (infra de decks) migrou para o container, junto à composição. (4) `export { eventBus }` mantido.
- **Fora do escopo (reportar):** `apps/web/**` e `packages/**` intocados.
