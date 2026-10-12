# @digimon/ads — Status

## Fase 1 — Fundação backend (task 102-backend-module-ads)
- [x] Pacote `@digimon/ads` (domain + use-cases + infra + barrel)
- [x] Entidade `Ad` (kind, placements[], janela de datas, contadores, `isVisibleAt`)
- [x] Interface `AdRepository` (DIP)
- [x] Use cases: List, Get, Create, Update, Delete, TrackClick
- [x] Implementação Prisma (`PrismaAdRepository`)
- [x] Schema Prisma + migration (`ads` + enum `AdKind`) — migration `20261012120000_ads`
- [x] Eventos `ad.created/updated/deleted`
- [x] Testes unitários (24) com repo em memória
- [x] Rotas API + admin (task 103-backend-ads-routes)
- [x] Frontend público (`AdSlot` + placements) (task 104-frontend-ads-slot)
- [x] Admin (CRUD de anúncios) (task 105-frontend-admin-ads)

## Handoff (task 102)
- **Feito:** bounded context `@digimon/ads` completo (domínio/use cases/infra/barrel) no padrão de `@digimon/content` e `@digimon/decks`, + schema Prisma e migration.
  - **Domínio:** `Ad` (aggregate raiz) com invariantes — `title` não vazio, `targetUrl` http(s), `placements.length >= 1`, `priority >= 0`, janela `startAt <= endAt`; `Static create`/`fromData`, `update(patch)` (revalida; contadores preservados) e `isVisibleAt(date)` (isActive + janela). `AdKind = 'house' | 'affiliate' | 'sponsor'`. `actor.ts` com curadoria exclusiva do `administrator` (`CURATION_ROLES`/`isCuradoria`/`requireCuradoria`). `AdRepository` (DIP): `create/update/delete/findById/list/activeForPlacement/incrementImpressions/incrementClicks`. Eventos `ad.created`/`ad.updated`/`ad.deleted` com `adEvent()`.
  - **Use cases:** `ListAdsUseCase` (curadoria: filtros `placement`/`kind`/`isActive` paginados; público: exige `placement`, ativos dentro da janela, ordenados por `priority` desc, até N candidatos — `PUBLIC_ADS_LIMIT = 5`, `limit`/`now` opcionais), `GetAdUseCase`, `CreateAdUseCase`, `UpdateAdUseCase`, `DeleteAdUseCase` (todos exigem curadoria e publicam eventos), `TrackAdClickUseCase` (incrementa `clicks`, best-effort: id inexistente → `{ tracked: false }`). Schemas Zod em `use-cases/schemas.ts`.
  - **Infra:** `PrismaAdRepository` mapeia `AdKind` Prisma (HOUSE/…) ↔ union do domínio (house/…) e o escalar `placements String[]`; `activeForPlacement` filtra `isActive` + janela (`startAt`/`endAt` nulos ou dentro) e ordena por `priority desc`; contadores via `increment`.
  - **Barrel:** `src/index.ts` exporta só o público (domínio + use cases + schemas + infra).
- **Arquivos:** `packages/modules/ads/**` (package.json, tsconfig, vitest.config, src/**), `packages/database/prisma/schema.prisma` (+ enum `AdKind`, model `Ad`, relação `User.createdAds`), `packages/database/prisma/migrations/20261012120000_ads/migration.sql`, `packages/database/src/index.ts` (+ `AdKind`, `Ad`), `context/modules/ads/status.md`.
- **Decisões:**
  1. **Curadoria = somente `administrator`** (não inclui editor — aplicação comercial/patrocínio); defense in depth nas rotas (task 103).
  2. **Rotação por peso** = ordenação determinística por `priority desc` + limite de candidatos (`PUBLIC_ADS_LIMIT = 5`) devolvido ao frontend, que faz a rotação efetiva. Sem aleatoriedade no backend (reprodutibilidade/teste).
  3. **`Ad` com relação `creator User @relation("AdCreator")`** (FK `createdBy`) para integridade; contadores `impressions`/`clicks` sem PII.
  4. **`isVisibleAt`** como expressão de domínio da janela; a `PrismaAdRepository.activeForPlacement` reproduz a MESMA janela em SQL.
  5. Sem rota de impressões dedicada no backend — `incrementImpressions(ids)` é exposto no repo e chamado best-effort pela rota pública (task 103), conforme o contexto do módulo.
- **Validação:** `pnpm turbo typecheck lint test --filter=@digimon/ads --filter=@digimon/database` ✅ (5/5 tasks; 24 testes unitários passando). Prisma client regenerado (`prisma generate`) com `Ad`/`AdKind`.
- **Migration:** `20261012120000_ads` criada (CREATE TYPE `AdKind`, CREATE TABLE `ads`, índices `[isActive]`/`[kind]`, FK `createdBy` → `User`). Aplicável via `pnpm --filter @digimon/database db:deploy` (não executada contra banco de dev nesta task).
- **Nota:** `pnpm install` foi executado automaticamente pelo PNPM ao rodar `prisma generate` (novo workspace package `@digimon/ads` detectado) — lockfile atualizado.
- **Pendências:** rotas HTTP + admin (task 103); `incrementImpressions` best-effort na rota pública (task 103); UI público/admin (tasks 104/105). Nenhuma neste escopo de backend.

## Handoff (task 103)
- **Feito:** rotas Fastify do módulo `@digimon/ads` em `apps/api` + composição.
  - **Composição:** `adsDeps()` no `container.ts` (reusa `prisma`/`eventBus`) instancia `PrismaAdRepository` + `ListAds`/`GetAd`/`CreateAd`/`UpdateAd`/`DeleteAd`/`TrackAdClick`; o repositório também é exposto para o incremento de impressões best-effort da rota pública.
  - **Rotas** (plugin `routes/ads.ts`, registrado sem prefixo em `routes/index.ts`): `GET /ads?placement=&limit=` (público, 200 `{ ads: AdDTO[] }`, sempre leitura pública — `actor: null` — janela de datas + rotação por peso; `limit` default 5/teto 10; incrementa `impressions` best-effort com log em falha), `POST /ads/:id/click` (público, 204; 404 se inexistente), `GET /ads/admin` (administrator, filtros `placement`/`kind`/`isActive` paginados `{ items, total, page, pageSize }`), `POST /ads/admin` (201 `{ id }`), `PATCH /ads/admin/:id` (200 `{ id }`), `DELETE /ads/admin/:id` (204).
  - **Sessão:** `getAuthContext` + `requireRole(context, 'administrator')` nas rotas admin (401 anônimo / 403 sem papel); públicas sem sessão. Erros de domínio (`AppError`) delegados ao handler global; sem `new PrismaClient` na rota.
  - **DTO `AdDTO`:** id, title, subtitle, imageUrl, targetUrl, kind, placements, ctaLabel, sponsorName, disclosure, isActive, priority, startAt/endAt (ISO/null), openInNewTab, impressions, clicks, createdAt, updatedAt.
- **Arquivos:** `apps/api/src/routes/ads.ts` (novo), `apps/api/src/routes/index.ts`, `apps/api/src/container.ts`, `apps/api/package.json` (+ dep workspace `@digimon/ads`), `pnpm-lock.yaml`.
- **Decisões:**
  1. **`GET /ads` força o ramo público (`actor: null`)** — a listagem de curadoria vive em `/ads/admin`; passar o ator da sessão faria um administrator receber a listagem admin (sem filtro de placement/limite) na rota pública.
  2. **`DELETE /ads/admin/:id` → 204 sem body** e **`POST /ads/:id/click` → 204** (best-effort), conforme o critério da task (o use case de delete devolve `{ id, deleted }`, descartado).
  3. **`limit` público:** clamp na rota (default `PUBLIC_ADS_LIMIT`=5, teto 10) antes do `listAdsSchema` (cujo teto é 50) — o teto efetivo da rotação é 10.
  4. **Escopo estendido aprovado:** `apps/api/package.json` não declarava `@digimon/ads`; sem a dependência o `container.ts` não resolvia o módulo (import via `@digimon/ads`, regra de fronteira). Adicionada a dep + `pnpm install`.
  5. **Migration aplicada localmente:** `20261012120000_ads` deployada no Postgres de dev (`db:deploy`) para o smoke real.
- **Validação:** `pnpm turbo typecheck lint build --filter=@digimon/app-api` ✅ (3/3 tasks). Smoke `app.inject` ✅ (18 asserções): `GET /ads` sem placement → 422; `GET /ads?placement` → 200 `{ ads }`; `GET /ads/admin` anônimo → 401; member → 403; `POST /ads/admin` → 201 `{ id }`; público serve o criado e incrementa `impressions` best-effort (got 1); `GET /ads/admin?placement&isActive` → 200; `PATCH` → 200; `POST /ads/:id/click` → 204; click inexistente → 404; `DELETE` → 204.
- **Pendências:** UI público (`AdSlot`/placements — task 104) e admin CRUD (task 105). Nenhuma neste escopo de backend.

## Handoff (task 104)
- **Feito:** feature `ads` no web (MVVM) + componente `AdSlot` + posições no portal.
  - **Model** (`features/ads/model/`): `types.ts` (espelho literal do `AdDTO`: `Ad`, `AdKind = 'house'|'affiliate'|'sponsor'`, `AdPlacement = 'home-top'|'home-infeed'|'cards-top'|'article-inline'` — sem importar `@digimon/ads` no client) e `ads-api.ts` (`listByPlacement(placement, limit?)` → `GET /ads?placement=&limit=` → `{ ads }`; `trackClick(id)` → `POST /ads/:id/click`).
  - **ViewModel** (`features/ads/viewmodels/use-ads.ts`): `useAdSlot(placement, { count })` via React Query; item único busca um pool (default do backend = 5) e faz **rotação por peso** (`priority`+1 como peso, `Math.random` no cliente — determinismo preservado no backend); in-feed (`count>1`) usa `limit=count` e mantém a ordem por peso; expõe `{ ads, isLoading, trackClick }` (`trackClick` fire-and-forget com `.catch`). Barrel em `viewmodels/index.ts`.
  - **View** (`components/ad-slot.tsx`, `'use client'`): `<AdSlot placement count className />`. Reserva altura (skeleton `h-28 sm:h-36` / `h-64` no in-feed) para evitar CLS e **não renderiza nada** quando não há anúncio. Criativo com `<img>` **nativo** (host dinâmico — sem dependência de `remotePatterns`); sem imagem → card textual (título + subtítulo + CTA). Link `target="_blank"` (respeita `openInNewTab`) com `rel="sponsored nofollow noopener"` para `affiliate`/`sponsor` e `rel="noopener"` para `house`; rótulo de divulgação (`disclosure` explícito ou "Publicidade"/"Parceiro" por tipo) em badge; `onClick` dispara `trackClick(ad.id)` sem bloquear a navegação; `alt={title}`/`aria-label="Publicidade"` (nada de `aria-hidden` no criativo). Export no barrel `components/index.ts`.
  - **Posições:** `home-top` (abaixo do hero) e `home-infeed` (`count=2`, após as últimas notícias) em `home-view.tsx`; `article-inline` (após o corpo) em `post-article.tsx`; `cards-top` (topo da listagem) em `cards-view.tsx`.
- **Arquivos:** `apps/web/src/features/ads/**` (novo), `apps/web/src/components/ad-slot.tsx` (novo), `apps/web/src/components/index.ts`, `apps/web/src/features/content/views/home-view.tsx`, `apps/web/src/features/content/views/post-article.tsx`, `apps/web/src/features/cards/views/cards-view.tsx`, `context/modules/ads/status.md`, `context/modules/web/status.md`.
- **Decisões:**
  1. **Rotação no cliente** (não no backend): item único pede o pool default (5 candidatos) e escolhe 1 por peso; in-feed pede `limit=count`. Evita aleatoriedade no backend (reprodutibilidade) e mantém a ordem por peso no in-feed.
  2. **`<img>` nativo** em vez de `next/image`: o host do criativo é dinâmico (CDN próprio / Amazon) — não depende de `next.config.ts` `remotePatterns` (que segue inalterado; nenhuma extensão necessária).
  3. **Skeleton com altura reservada** enquanto carrega (`isLoading`) e `null` quando a lista vem vazia — atende "reserva a altura" + "não renderiza nada quando não há anúncio".
  4. **`rel` por tipo:** `affiliate`/`sponsor` → `sponsored nofollow noopener`; `house` → `noopener`. Rótulo de divulgação sempre que `disclosure` estiver setado ou o tipo não for `house`.
  5. Sem scripts de terceiros/cookies (house/afiliado) — apenas `<img>` + link, conforme o contexto do módulo.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2 tasks). `next build` **não** executado (conforme a task).
- **Pendências:** admin CRUD de anúncios (task 105). `next.config.ts` **não** precisou de mudança (host dinâmico resolvido com `<img>` nativo) — sem gap de escopo.

## Handoff (task 105)
- **Feito:** página `/admin/anuncios` (curadoria de anúncios) na feature `admin` (MVVM), consumindo as rotas admin reais do módulo `@digimon/ads`.
  - **Model** (`features/admin/model/ads-admin-api.ts`): `adsAdminApi` — `list({ placement?, kind?, isActive?, page?, pageSize? })` → `GET /ads/admin` (`PaginatedResult<Ad>`); `create(input)` → `POST /ads/admin`; `update(id, patch)` → `PATCH /ads/admin/:id`; `remove(id)` → `DELETE /ads/admin/:id`. Tipos `AdUpsertInput` (espelho do `createAdSchema`) e `AdUpsertPatch` (Partial); constantes `AD_KINDS`/`AD_PLACEMENTS`. **Reusa** `Ad`/`AdKind`/`AdPlacement` de `features/ads/model/types` (sem importar `@digimon/ads` no client). `ApiError` reexportado de `@digimon/api-client`.
  - **ViewModel** (`features/admin/viewmodels/use-admin-ads.ts`): `useAdminAds` — listagem via React Query com **filtros placement/kind/isActive** + paginação; mutations **ativar/desativar** (`update({ isActive })`) e **excluir** com invalidação de `['admin-ads']`; estado do painel de formulário (`isFormOpen`/`editing`/`openCreate`/`openEdit`/`closeForm`). `useAdminAdForm` — estado do formulário + validação leve (título, URL http(s), placements ≥ 1, prioridade inteira ≥ 0, janela início ≤ fim) e mutations create/update; helpers `toAdFormValues`/`emptyAdFormValues` (ISO ↔ `datetime-local`).
  - **View** (`features/admin/views/admin-ads-view.tsx`, `'use client'`, só JSX): tabela via `AdminTable` (título+patrocinador, tipo, placements, status, janela, impressões/cliques) com ações **Ativar/Desativar**, **Editar** e **Excluir** (confirmação) + estados loading/erro/vazio. **Formulário inline** (criar/editar) cobrindo todos os campos: título, subtítulo, imagem (URL), **link de destino** (com dica contextual por tipo — afiliado sugere Amazon; house, e-commerce próprio; e nota do `rel="sponsored nofollow noopener"`), tipo (house/affiliate/sponsor), placements (multi-seleção dos 4), CTA, patrocinador, rótulo de divulgação, ativo, prioridade, janela (startAt/endAt) e abrir-em-nova-aba. `AdminPageHeader` + chips de filtro (`FilterGroup`).
  - **Página** (`app/admin/anuncios/page.tsx`, server): `metadata` title "Anúncios" + `robots: { index: false }`; monta `AdminAdsView`. **Sidebar:** item **"Anúncios"** (`Megaphone`) no `AdminShell`, entre "Moderação de decks" e "Comentários"; **oculto para editor** (gate de role — curadoria é administrator-only).
  - **Barrel** `features/admin/index.ts` atualizado (`adsAdminApi`, `AD_KINDS`, `AD_PLACEMENTS`, tipos `AdminAdsListParams`/`AdUpsertInput`/`AdUpsertPatch`, `AdminAdsView`, `useAdminAds`/`useAdminAdForm`/`toAdFormValues`/`emptyAdFormValues`, tipos `AdFormValues`/`AdminAdsStatusFilter`).
- **Arquivos:** `apps/web/src/features/admin/model/ads-admin-api.ts` (novo), `apps/web/src/features/admin/viewmodels/use-admin-ads.ts` (novo), `apps/web/src/features/admin/views/admin-ads-view.tsx` (novo), `apps/web/src/features/admin/views/admin-shell.tsx`, `apps/web/src/features/admin/index.ts`, `apps/web/src/app/admin/anuncios/page.tsx` (novo), `context/modules/ads/status.md`, `context/modules/web/status.md`.
- **Decisões:**
  1. **Escopo estendido a `admin-shell.tsx`** (não constava no `## Escopo` original): o passo 4 da task exige o item de navegação; a instrução explícita do usuário autorizou a extensão. Item **oculto para editor** (só administrator gerencia — a rota `/admin/anuncios` fica fora do menu para editor; o layout admin segue permitindo editor nas outras rotas e o backend revalida o 403).
  2. **Formulário inline na própria página** (não há rota de formulário no escopo — só `app/admin/anuncios/page.tsx`): `openCreate`/`openEdit` no ViewModel controlam o painel; o form é remontado por `key` (`editing?.id ?? 'new'`) para inicializar os valores uma vez.
  3. **Reuso dos tipos da feature `ads`** (`features/ads/model/types`) em vez de redefinir — evita divergência com o `AdDTO` e mantém a regra "não importar `@digimon/ads` no client".
  4. **Tipos de payload próprios** (`AdUpsertInput`/`AdUpsertPatch`) espelhando `createAdSchema`/`updateAdSchema`; o toggle de ativo usa `update(id, { isActive })` (PATCH parcial).
  5. **Sem React Hook Form/Zustand**: o projeto (features admin existentes) usa `useState` nos ViewModels — mantida a consistência; validação leve no cliente (o backend revalida com Zod).
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2 tasks — 0 erros/0 warnings). `pnpm harness check` ✅. `next build` **não** executado (conforme a task).
- **Pendências:** nenhuma. `@digimon/ads` **não** foi importado no client (sem mudança de deps).
