# @digimon/decks — Status

## Fase 1 — Fundação
- [x] Domain entities (Deck + DeckCopy + slugify + invariantes)
- [x] Repository interfaces (DeckRepository + CardReferenceValidator — DIP)
- [x] Use cases (DIP): create / update / publish / delete / get / list / copy
- [x] Implementação Prisma (PrismaDeckRepository)
- [x] Testes unitários (deck-workflow.spec.ts — 22 testes)
- [x] Testes de integração (task 97: `src/test/decks.integration.spec.ts`, gated por `TEST_DATABASE_URL`)

## Fase 2 — Refinamentos
- [x] Integração de eventos (EventBus: created / updated / published / copied)
- [x] Rotas HTTP (apps/web/src/app/api/decks/**)
- [x] UI/frontend (MVVM: features/decks)
- [x] Typecheck: ✅ `pnpm turbo typecheck`
- [x] Lint: ✅
- [x] Testes: ✅ 22 passed

## Fase 3 — Gestão admin (task 16-rota-admin-decks)
- [x] `DeleteDeckUseCase` com override de dono no DOMÍNIO: Admin/Editor (papéis globais, ADR-004) excluem QUALQUER deck; Member não-dono segue ForbiddenError
- [x] `ListDecksUseCase`: actor admin/editor ignora `publicOnly` (vê rascunhos + published + unlisted) com filtro de status opcional; público/member mantêm comportamento atual
- [x] Rotas admin: `GET /api/admin/decks` (administrator|editor) e `DELETE /api/admin/decks/:slug` (administrator)
- [x] Feature admin `use-admin-decks`/`AdminDecksView`/`adminDecksApi` usando as rotas admin (sem fallback por autoria) + filtro de status
- [x] Testes: 26 passed (4 novos: admin deleta deck de outro; editor deleta deck de outro; admin vê todos os status; editor filtra por status)
- [x] Typecheck: ✅ | Lint: ✅ | Testes: ✅ 26 passed

## Fase 4 — Porte para a API (task 41-backend-decks-routes)
- [x] `apps/api/src/routes/decks.ts` — 9 rotas Fastify portadas de `apps/web/src/app/api/decks/**` + `/api/admin/decks/**` (caminhos completos `/decks` e `/admin/decks`)
- [x] Contratos JSON/erros idênticos (owner-only + override admin no domínio, sem duplicar regra)
- [x] Composição inline no arquivo (DIP): `PrismaDeckRepository` + `PrismaCardReferenceValidator` + use cases, reusando `eventBus` do container
- [x] Typecheck: ✅ | Lint: ✅ | Build `@digimon/app-api`: ✅ (esbuild)
- [x] Smoke via `app.inject`: ✅ 22 checks (401 anônimo, 403 RBAC admin, 404 draft anônimo, 201 create, 200 get/patch/mine/delete, 404 pós-delete)
- [x] Strangler: `apps/web/**` intocado (handlers web seguem no ar)

## Fase 5 — Modelo de lista dupla + legalidade (task 62)
- [x] Entidade `Deck` com `eggList` + `coverCardId` (invariantes em cardList e eggList)
- [x] `PrismaDeckRepository` persiste/lê `eggList` (JSON) e `coverCardId` (nullable)
- [x] Schemas Zod (create default `eggList []`; update opcional) + propagação em Create/Update
- [x] `CardReferenceValidator.inspect` (`CardReferenceInfo`) + impl no container (`DIGIEGG`)
- [x] `CheckDeckLegalityUseCase` (main 50 / egg ≤5 / limite de cópias / unknown / wrong_zone)
- [x] `PublishDeckUseCase` exige deck legal
- [x] Rotas API expõem `eggList`/`coverCardId`
- [x] Typecheck: ✅ | Lint: ✅ | Testes: ✅ 37 passed (11 novos)

## Fase 6 — Import/export de decklist (task 63)
- [x] `DeckCardResolver` (DIP) + tipos em `domain/deck-list/types.ts`
- [x] `parseDeckList` (texto: DigimonCard.io/Untap/ordem custom; TTS JSON; comentários; normalização; caps/skipped/trimmed)
- [x] `serializeDeckList` (formato DigimonCard.io; egg antes do main; round-trip com o parser)
- [x] `domain/deck-sizes.ts` (fonte única de MAIN/EGG/DEFAULT_MAX; `check-deck-legality` re-exporta)
- [x] Testes `domain/deck-list/deck-list.spec.ts` (17 testes)
- [x] Typecheck: ✅ | Lint: ✅ | Testes: ✅ 54 passed (17 novos)

## Fase 7 — Comunidade de decks: snapshot, feed, likes, cópias e moderação (task 64)
- [x] `domain/community/community-types.ts` — contrato (status/sort/period, summary/detail, publications, reports, fila)
- [x] `domain/entities/public-deck.ts` — `PublicDeck.fromSource` (congela + invariante `legal`), `isOutdated`, `refresh`
- [x] `domain/community/deck-name-moderation.ts` — `reviewDeckName` (trim/max 40/termos bloqueados), pura
- [x] `domain/community/community-colors.ts` — `DeckColorResolver` (DIP) + `dominantColors` (até 3)
- [x] `domain/repositories/public-deck-repository.ts` — interface (DIP) com contadores transacionais
- [x] Use cases `use-cases/community/*` — publish/unpublish/listPublications/listCommunity/get/like/unlike/copy/report/moderate/listReported/openReports/dismissReports
- [x] `infra/repositories/prisma-public-deck-repository.ts` — impl Prisma (join autor; contadores/status via SQL raw)
- [x] Eventos `deck.publication.{published,unpublished,liked,reported,moderated}`
- [x] Barrel atualizado; testes `community.spec.ts` (26 testes)
- [x] Typecheck: ✅ | Lint: ✅ | Testes: ✅ 80 passed (26 novos)

## Fase 8 — Rotas Fastify da comunidade de decks (task 65)
- [x] `apps/api/src/routes/community-decks.ts` — 14 rotas (feed/detalhe/like/unlike/cópias/reportes/publicações + legalidade/import/export + moderação admin)
- [x] `apps/api/src/container.ts` — `communityDecksDeps()` + adapters `PrismaDeckCardResolver`/`PrismaDeckColorResolver` (DIP via `@digimon/cards`)
- [x] `apps/api/src/routes/community-rate-limit.ts` — token bucket em memória por conta (like 30/2s, publish 10/30s, report 5/60s)
- [x] `apps/api/src/routes/index.ts` — registra `communityDecksRoutes`
- [x] Erros de domínio delegados ao handler global (AppError → `{ error: { code, message, details } }`); sem regra de domínio duplicada
- [x] Typecheck: ✅ | Lint: ✅ | Build `@digimon/app-api`: ✅ (esbuild)
- [x] Smoke via `app.inject`: ✅ 36/36 (401 anônimo nas escritas; 403 `own_deck` no like/report do próprio; 200 feed/detalhe/publicações; 422 publish de deck ilegal; 403 moderação p/ member; 204 copy/unpublish; 200 fila/moderação p/ admin; import/legality/export)
- [x] `pnpm harness check --barrel --db`: ✅

## Fase 9 — Frontend da comunidade de decks (task 66)
- [x] `apps/web/src/features/decks/model/community-types.ts` + `community-api.ts` — contrato literal + client das rotas `/decks/community*`, `/decks/legality`, `/decks/import`, `/decks/:slug/export`
- [x] `viewmodels/deck-sections.ts` — seções (Eggs → Digimon por nível → Tamers → Options → Outros), curva de custo, cores dominantes (metadados de `@/features/cards`)
- [x] ViewModels `use-community-decks` (feed + like otimista), `use-community-deck` (detalhe/copiar), `use-deck-publications`, `use-deck-import-export`
- [x] Views `community-decks-view`, `community-deck-detail-view`, `deck-publish-modal`, `deck-import-modal`, `deck-export-modal`; `deck-form-view` com eggList/coverCardId/legalidade ao vivo
- [x] `DeckCard` (design system) com props aditivas; páginas `/decks/comunidade` e `/decks/comunidade/[id]`
- [x] typecheck + lint + build `@digimon/app-web` ✅

## Fase 10 — Busca de cartas do criar-deck com "Carregar mais" (task 78)
- [x] Novo ViewModel `features/cards/viewmodels/use-card-search.ts` (MVVM) — busca paginada com append de páginas (`useInfiniteQuery`, `pageSize=24`), reusando `cardsApi.listCards` + `total`
- [x] `deck-form-view.tsx`: `useCardList` → `useCardSearch`; resultados acumulados + contagem "Mostrando X de Y" + botão **"Carregar mais"** (`hasMore`) + **"Limpar filtros"** (`reset`)
- [x] **Hovercard** (`CardHoverCard`, task 77) integrado a cada resultado da busca
- [x] Filtros (tipo/cor) e busca por nome/efeito mantidos; mudança de filtro/busca volta à 1ª página
- [x] Steppers de quantidade (task 72) preservados
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings)

## Fase 11 — Página de detalhe do deck (`/decks/[slug]`) (task 79)
- [x] Rota `apps/web/src/app/(public)/decks/[slug]/page.tsx` (nova) — antes `/decks/{slug}` dava **404**; `generateMetadata` SSR (nome/descrição do deck) + `<DeckDetailView slug={slug} />`
- [x] `deck-detail-view.tsx` reescrito: cabeçalho (nome, `StatusBadge`, formato, main/egg/total, descrição, capa via `CardTile`), **legalidade** (`POST /decks/legality`) com badge + violações, **decklist em seções** (`groupDeckSections`) com nome + miniatura + quantidade + `CardHoverCard` (task 77) e curva de custo (`deckCurve`)
- [x] **Ações por papel** (`useSession` no ViewModel): dono → Editar (`/decks/{slug}/editar`, task 80), Publicar (se draft), Publicar/Despublicar na comunidade (`useDeckPublications`), Exportar (`DeckExportModal`, texto), Excluir (confirmação via `DeckPublishModal`); visitante → Copiar
- [x] `use-deck.ts` virou o ViewModel completo (`useDeck(slug)`): deck + metadados das cartas (`useQueries` sobre `cardsApi.getCard`) + legalidade + ações, com `isNotFound` (404 sem vazar) e `isOwner`/`ownerName`
- [x] MVVM estrito: a View só consome `useDeck` (zero `useQuery`/`useMutation`); nenhum import de `@digimon/decks` no client
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings)

## Fase 12 — Edição de deck (`/decks/[slug]/editar`) (task 80)
- [x] Rota `apps/web/src/app/(member)/decks/[slug]/editar/page.tsx` (nova) — container largo (`max-w-[1440px]`, padrão da task 75) + `<DeckFormView mode="edit" slug={slug} />`; gate de Member herdado do grupo `(member)`
- [x] `use-deck-form.ts` ganhou modo edição (`{ mode, slug, initialDeck? }`): carrega o deck (`decksApi.getDeck`) e preenche `values`/`cardList`/`eggList`/`coverCardId`; salva via `decksApi.updateDeck` (PATCH) — sem `status`/`slug` (schema `.strict()`)
- [x] `deck-form-view.tsx`: props `mode`/`slug`, CTA "Salvar alterações", slug informativo, redirect para `/decks/{slug}` após salvar; layout 2 colunas (task 72) e busca acumulada (task 78) preservados
- [x] Fluxo de criação (`mode: 'create'` default) inalterado
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` não executado)

## Fase 13 — Gate de dono na página de editar deck (task 86)
- [x] `apps/web/src/app/(member)/decks/[slug]/editar/page.tsx`: gate de dono no Server Component — `getSession()` + deck via `fetch` SSR com o cookie de sessão encaminhado
- [x] Deck inexistente → `notFound()`; `deck.ownerId !== session.userId` (ou sessão ausente) → `redirect('/decks/' + slug)` — não-dono nunca vê o form de edição (antes só falhava no `PATCH` 403)
- [x] Rascunho do dono acessível (cookie encaminhado → `GET /decks/:slug` 200); gate de Member herdado de `(member)` intacto
- [x] ViewModel/View do form intocados
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings)

## Fase 14 — Detalhe do deck: `CardThumb` via `next/image` + export em PNG (task 84)
- [x] `deck-detail-view.tsx`: `CardThumb` migrado de `<img>` para `next/image` (`fill`/`sizes`, fallback `onError`/sem `imageUrl` preservado)
- [x] Novo ViewModel `viewmodels/use-deck-image-export.ts` — gera o deck completo em PNG via canvas (título/formato/cores/capa + seções com arte + nome + quantidade), estados idle/generating/ready/error, download `deck-<slug>.png`
- [x] Arte carregada pela imagem otimizada **same-origin** do Next (`/_next/image?url=…`) — evita o canvas taint no `toBlob`; falha de imagem individual cai em placeholder (degradação segura)
- [x] Nova View `views/deck-image-export-button.tsx` (botão + prévia + estados) + aba **"Imagem"** no `DeckExportModal` (prop opcional `imageExport`, retrocompatível)
- [x] `views/index.ts` exporta `DeckImageExportButton`
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` não executado)

## Fase 15 — Robustez do download do PNG (task 96)
- [x] `viewmodels/use-deck-image-export.ts` — `download()` agora anexa o `<a>` ao `document.body` antes do `click()` e remove depois (`setTimeout(0)`); `href`/`download`/PNG inalterados
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` não executado)

## Fase 16 — Testes de integração com Postgres real (task 97)
- [x] `src/test/integration-db.ts` — helper de conexão **gated por `TEST_DATABASE_URL`** (reusa o padrão do `@digimon/database`: Prisma 7 + `@prisma/adapter-pg`; `truncateTables()` entre testes)
- [x] `src/test/decks.integration.spec.ts` — `describe.skipIf(!hasTestDatabase)` (pulado sem a env; CI verde)
- [x] CRUD de deck + `eggList`/`coverCardId` (JSON/null round-trip) via `PrismaDeckRepository`
- [x] Comunidade via `PrismaPublicDeckRepository`: snapshot, like/unlike (contadores idempotentes), `addCopy` (1 por conta), report (1 aberto por conta) e `moderate hide` (`setStatus`+`dismissReports` fecha a fila)
- [x] Executado contra Postgres real (`digimon_test`): **9/9 passed** (ver Handoff)
- [x] `pnpm turbo typecheck lint test --filter=@digimon/decks` verde

## Fase 17 — Doc do comando correto da suíte de integração (task 99)
- [x] `src/test/integration-db.ts` — cabeçalho corrigido para `TEST_DATABASE_URL=postgresql://... pnpm --filter @digimon/decks test` + nota do Turbo `envMode: "strict"` (env filtrada → suíte pulada em silêncio)
- [x] Só comentários/documentação — nenhuma mudança de lógica (`describe.skipIf`, helpers e specs intocados)
- [x] `pnpm turbo typecheck lint test --filter=@digimon/cards --filter=@digimon/decks` verde (integração pulada sem env: 9 skipped)

## Handoff

### Handoff task 99 (doc do comando de integração — Turbo env strict)
- **Feito (backend, só comentários):** `packages/modules/decks/src/test/integration-db.ts` (e o espelho em `@digimon/cards`, mesma task). O cabeçalho documentava `TEST_DATABASE_URL=… pnpm turbo test --filter=@digimon/decks`, mas no **Turbo 2.11.5** o `envMode` é `strict` por default e `turbo.json` não declara `TEST_DATABASE_URL` → a env é **filtrada** das tasks, `hasTestDatabase` fica falso e a suíte é **pulada em silêncio**. Corrigido para `pnpm --filter @digimon/decks test` + nota (`--env-mode=loose` se precisar do Turbo).
- **Arquivos:** `packages/modules/decks/src/test/integration-db.ts`, `packages/modules/cards/src/test/integration-db.ts` (espelho), `context/modules/{decks,cards}/status.md`.
- **Decisões:** nenhuma de domínio — task puramente de documentação; lógica de teste intocada.
- **Validação:** `pnpm turbo typecheck lint test --filter=@digimon/cards --filter=@digimon/decks` — 6/6 ✅ (integração pulada sem env; 80+29 testes unitários verdes).
- **Fora do escopo:** nenhum.

### Handoff task 97 (testes de integração com Postgres real — decks)
- **Feito (backend, só `src/test/**`):** criada a suíte de integração do `@digimon/decks`, **gated por `TEST_DATABASE_URL`**. `src/test/integration-db.ts` (helper novo; `decks` não tinha `src/test/`): `hasTestDatabase`/`createTestPrisma()`/`truncateTables()`. `src/test/decks.integration.spec.ts` cobre via `PrismaDeckRepository` (CRUD + `eggList`/`coverCardId` JSON/null + `list` com `publicOnly`/`ownerId`/full-text `decks_search_idx`) e via `PrismaPublicDeckRepository` os caminhos com **SQL/transação** que o repo em memória não exercita: snapshot (`create`/`findById` com autor/`findBySourceDeck`), **like/unlike** (contador idempotente, `likedByMe`), **addCopy** (1 por conta, `ON CONFLICT DO NOTHING`), **report** (1 aberto por conta — novo substitui — + `queueReports`) e **moderate hide** (`setStatus('hidden')` + `dismissReports` esvazia a fila). **Sem env** é pulada (`describe.skipIf`) → CI verde.
- **Arquivos:** `packages/modules/decks/src/test/integration-db.ts` (novo), `packages/modules/decks/src/test/decks.integration.spec.ts` (novo), `context/modules/decks/status.md`.
- **Decisões:** (1) `@prisma/adapter-pg` é dependência do `@digimon/database` — resolvido via `createRequire` ancorado no próprio pacote (test-only; **sem tocar `package.json`/configs**). (2) Repos exercitados diretamente (não os use cases) — isola a camada SQL/transação. (3) `truncateTables` com `RESTART IDENTITY CASCADE` sobre `User`/`decks`/`public_decks`/likes/copies/reports.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/{cards,decks}` ✅; **com** `TEST_DATABASE_URL` (`digimon_test`, migrado): `pnpm --filter @digimon/decks test` → **89 passed (9 de integração)**; **sem** env: 9 skipped e unit verdes.
- **Fora do escopo:** nenhum. Nenhum arquivo de produção/`package.json`/config tocado.

### Handoff task 96 (robustez do download do PNG — `<a>` anexado ao DOM)
- **Feito (frontend, `apps/web`):** no `download()` do VM `useDeckImageExport`, o `<a>` passa a ser anexado ao `document.body` (`anchor.style.display = 'none'` + `appendChild`) **antes** do `anchor.click()` e removido logo depois via `window.setTimeout(..., 0)`. Mantido `href = previewUrl` (blob) e `download = fileName`; a revogação da URL no reset/regenerate segue intacta. Sem mudança do PNG/comportamento visível.
- **Arquivo:** `apps/web/src/features/decks/viewmodels/use-deck-image-export.ts` (único).
- **Decisões:** (1) `setTimeout(0)` em vez de remover síncrono — dá tempo do navegador iniciar o download com o nó ainda no DOM (padrão à prova de falhas); (2) `display: none` — o anchor anexado não deve afetar layout.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings; `next build` **não** executado).
- **Fora do escopo:** nenhum.

### Handoff task 84 (detalhe do deck — miniatura via next/image + export em PNG)
- **Feito (frontend, `apps/web`):** (1) o `CardThumb` do decklist do detalhe usa `next/image` (`fill`+`sizes`) com fallback preservado; (2) export do deck em **PNG** via canvas. O VM `useDeckImageExport` carrega as artes pela imagem otimizada same-origin do Next (`/_next/image`), evitando o canvas taint, e desenha cabeçalho (nome/formato/main/egg/total/descrição/cores), capa e decklist com arte+número+nome+quantidade num canvas 1200px (escala 2×); `toBlob('image/png')` → `URL.createObjectURL` → download `deck-<slug>.png`. A View `DeckImageExportButton` expõe os estados (gerando/pronto/falhou) e a prévia; o `DeckExportModal` ganhou a aba "Imagem" via prop opcional `imageExport`.
- **Arquivos:** `apps/web/src/features/decks/views/deck-detail-view.tsx`, `views/deck-image-export-button.tsx` (novo), `views/deck-export-modal.tsx`, `viewmodels/use-deck-image-export.ts` (novo), `views/index.ts`, `context/modules/{web,decks}/status.md`.
- **Decisões:** (1) **`/_next/image` como fonte da arte** (same-origin) — desenhar a URL cross-origin quebraria `toBlob`; `w=128`/`w=384` na allowlist padrão do Next. (2) Funções puras de render no arquivo do VM (escopo limita a um VM); View permanece só JSX. (3) **Degradação segura:** capa e miniaturas falham de forma independente → placeholder colorido com o número, sem quebrar o export. (4) Prop `imageExport` **opcional** no modal — `community-deck-detail-view.tsx` (fora do escopo) segue sem tabs. (5) `<img>` nativo só para a prévia `blob:`.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (instrução da task).
- **Fora do escopo:** nenhum. Tasks 85/86/87 (`page.tsx` público/editar, `features/cards/**`) intocadas; `community-deck-detail-view.tsx` intocado.

### Handoff task 86 (gate de dono em `/decks/[slug]/editar`)
- **Feito (frontend, `apps/web`):** a página de edição do deck passa a ser **só do dono**. Como o `GET /decks/:slug` é público para decks publicados, um não-dono conseguia abrir o form (`/decks/{slug}/editar`) e só era barrado no `PATCH` (403). O `page.tsx` (Server Component sob `(member)`) agora: (1) lê a sessão (`getSession()`); (2) busca o deck via `fetch` SSR **encaminhando o cookie `access_token`** da request (para o dono enxergar o próprio rascunho); (3) `notFound()` se o deck não existir; (4) `redirect('/decks/' + slug)` se `deck.ownerId !== session.userId` (ou sessão ausente).
- **Arquivo:** `apps/web/src/app/(member)/decks/[slug]/editar/page.tsx` (único). `use-deck-form.ts`/`deck-form-view.tsx` **intocados** (gate é só na página).
- **Decisões:** (1) padrão da task 85 (`cookies()` + `fetch` SSR com header `cookie`) — o `decksApi.getDeck` é client-side e não encaminha cookie no SSR; o web é frontend puro (ADR-007), então o `fetchDeck` fica local à página. (2) `cache: 'no-store'` + falha → `null` (resiliente). (3) `!session || deck.ownerId !== session.userId` → redirect para a página pública (o layout `(member)` já garante sessão; o `!session` cobre o tipo). (4) `apiBaseUrl` de `@/lib/api-base` (SSR → `API_INTERNAL_URL`).
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings; `next build` **não** executado). Falha intermediária de typecheck fora do escopo (`card-filters.tsx` — task 87) resolvida pela task concorrente e revalidada.
- **Fora do escopo (reportar):** tasks ativas 85/84/87 não tocadas.

### Handoff task 80 (página de editar o deck — `/decks/[slug]/editar`)
- **Feito (frontend, `apps/web`):** criada a rota `/decks/[slug]/editar` (antes inexistente) e adicionado o **modo edição** ao formulário de deck. `page.tsx` (Server Component, sob `(member)`) usa container largo + cabeçalho "Editar deck" e monta `<DeckFormView mode="edit" slug={slug} />`. O `useDeckForm({ mode, slug, initialDeck? })` carrega o deck por `decksApi.getDeck` e hidrata o formulário (`values` nome/slug/descrição/formato/status + `cardList`/`eggList`/`coverCardId`); `handleSubmit` passa a usar `decksApi.updateDeck` (PATCH). A View ajusta os CTAs ("Salvar alterações"), substitui a edição de slug por um aviso informativo e redireciona para o detalhe após salvar; o painel "Publicar na comunidade" segue disponível para o deck já salvo.
- **Arquivos:** `apps/web/src/app/(member)/decks/[slug]/editar/page.tsx` (novo), `apps/web/src/features/decks/views/deck-form-view.tsx`, `apps/web/src/features/decks/viewmodels/use-deck-form.ts`, `context/modules/{web,decks}/status.md`.
- **Decisões:** (1) **PATCH sem `status`/`slug`** — `updateDeckSchema` é `.strict()` e não aceita `status`; só os campos editáveis vão no corpo (o status é preservado server-side). (2) **Slug fixo na edição** (o valor preenchido serve só para exibir a URL). (3) **Descrição vazia → `null`** no edit (permite limpar). (4) **Hidratação única** (`useRef`) — refetch não sobrescreve edições. (5) **Redirect no View** (`useRouter`) — a página é Server Component (mantém `metadata`/`robots`) e não pode receber callback. (6) **404 sem vazar** (`isNotFound`) e gate de dono no save permanece no backend (PATCH 403).
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (conforme instrução da task).
- **Fora do escopo (reportar):** tasks ativas 82 (`card-filters.tsx`/`packages/modules/cards`) e 83 (`card-tile.tsx`/`card-hover-card.tsx`/`next.config.ts`) intocadas. `views/index.ts`/`viewmodels/index.ts` (barrels) **não** editados — assinaturas preservadas (novos tipos `DeckFormMode`/`UseDeckFormOptions` ficaram fora do `## Escopo`).

### Handoff task 79 (página de detalhe do deck — `/decks/[slug]`)
- **Feito (frontend, `apps/web`):** criada a rota `/decks/[slug]` (antes 404) e reescrito o detalhe do deck. `page.tsx` (novo) é servidor com `generateMetadata` (fetch SSR a `GET /decks/:slug`; 404 → "Deck não encontrado") renderizando `<DeckDetailView slug={slug} />`. O `DeckDetailView` passou a ter: cabeçalho (nome, `StatusBadge` draft/publicado, formato, contagens main/egg/total, descrição, capa `CardTile` e dono), **legalidade** com badge + lista de violações, **curva de custo** e **decklist em seções** (Eggs → Digimon por nível → Tamers → Options → Outros) com **miniatura + nome + número + quantidade** e **hovercard** (`CardHoverCard`, task 77) por carta — resolvendo `cardId → carta` por índice (mesma abordagem do form). Ações por papel: dono (Editar/Publicar/Publicar-ou-Despublicar na comunidade/Exportar/Excluir com confirmação) e visitante (Copiar). O `use-deck.ts` virou o ViewModel completo (`useDeck(slug)`).
- **Arquivos:** `apps/web/src/app/(public)/decks/[slug]/page.tsx` (novo), `apps/web/src/features/decks/views/deck-detail-view.tsx`, `apps/web/src/features/decks/viewmodels/use-deck.ts`, `context/modules/{web,decks}/status.md`. (`views/index.ts` **não** precisou de mudança — a assinatura `DeckDetailView`/`DeckDetailViewProps` foi mantida.)
- **Decisões:** (1) **Índice de cartas** no ViewModel (`useQueries` sobre `cardsApi.getCard`, cache `['card', id]`), igual ao form (task 72) — a View recebe `resolveHoverCard(cardId)` e cobre a capa via `toCardTileData`. (2) **Legalidade** via `useQuery` (`POST /decks/legality`, key por `deck.updatedAt`) — não duplica regra de domínio. (3) **404 sem vazar**: `isNotFound` = `ApiError.status === 404`; a View mostra "Deck não encontrado" e não o erro cru. (4) **Dono sem nome**: não há `GET /users/:id` público, então o nome do dono só aparece quando o visitante **é** o dono (nome da sessão); para não-dono, a linha do dono é omitida (permitido pela spec "senão omitir"). (5) **Confirmação de exclusão** reusa `DeckPublishModal` (modal genérico de confirmação do design system) em vez de `window.confirm`. (6) **Editar** aponta para `/decks/{slug}/editar` (task 80, ainda na queue) — link presente conforme a spec. (7) `useDeck` mantém o nome e o `export type { Deck }` (compatibilidade com o barrel `viewmodels/index.ts`).
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings; `--max-warnings 0` nos arquivos tocados). `next build` **não** executado (conforme instrução da task).
- **Fora do escopo (reportar):** (a) **Exportação em PNG não existe** no projeto (sem lib/rota) — implementado o export em **texto** (DigimonCard.io) reusando `DeckExportModal`/`useDeckImportExport`; PNG fica como pendência. (b) `views/index.ts` intocado (assinatura preservada). (c) `deck-form-view.tsx`/`use-deck-form.ts` (task 80 ativa) e `components/**`, `apps/api/**`, `packages/**` intocados.

### Handoff task 78 (busca de cartas do criar-deck — "Carregar mais" + relacionados)
- **Feito (frontend, `apps/web`):** a busca de cartas do `/decks/novo` deixou de mostrar só a 1ª página. Novo ViewModel de feature `apps/web/src/features/cards/viewmodels/use-card-search.ts` (`useInfiniteQuery` v5) que **acumula** páginas de 24 e expõe `{ cards, total, search, filters, setFilters, reset, isLoading, isError, isFetchingMore, hasMore, loadMore, refetch }`. A `deck-form-view.tsx` passou a usar `useCardSearch` no lugar de `useCardList`, exibe a contagem "Mostrando X de Y", o botão **"Carregar mais"** no fim da lista (quando `hasMore`), o botão **"Limpar filtros"** (usa `reset`, reseta para a 1ª página) e integra o **hovercard** (`CardHoverCard`, task 77) em cada resultado.
- **Arquivos:** `apps/web/src/features/cards/viewmodels/use-card-search.ts` (novo), `apps/web/src/features/decks/views/deck-form-view.tsx`, `context/modules/{web,decks,cards}/status.md`.
- **Decisões:** (1) `hasMore` via `getNextPageParam` (`page * pageSize < total`) — usa o `total` que o `GET /cards` já devolve; (2) `filters` compõe a `queryKey` → qualquer mudança de filtro/busca reinicia a paginação (sem estado de `page` na View); (3) `use-deck-form.ts` **não** precisou de mudança (`addCard`/`addEggCard` já aceitam `CardSummary`, superset de `Card`); (4) hovercard dentro do `<li>` para manter HTML válido (`<div>` do wrapper não pode ser filho direto de `<ul>`).
- **Validações:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (conforme instrução da task).
- **Fora do escopo (reportar):** `apps/api/**`, `packages/**` e `components/**` intocados. A task 79 (ativa) toca `deck-detail-view.tsx`/`use-deck.ts`/`app/(public)/decks/[slug]/` — não tocados por esta task.

### Handoff task 72 (redesenho do formulário de criar deck — UX)
- **Feito (frontend, `apps/web`):** reescrita de `features/decks/views/deck-form-view.tsx` + evolução de `features/decks/viewmodels/use-deck-form.ts` para corrigir os 6 problemas de UX do `/decks/novo`.
  - **Slug** derivado do nome (local `slugify`, espelho do domínio) e movido para linha secundária "URL: /decks/<slug>" + `<details>` avançado.
  - **Sem `<form>` aninhado** (removidos form externo e de busca; Enter na busca não submete).
  - **Quantidades 1..4**: `incrementCard`/`decrementCard`/`setQuantity(zone, cardId, qty)` no VM, com clamp por `maxCountInDeck` (default 4) e pelos caps de zona (main 50 / egg 5); `addCard`/`addEggCard` recebem `CardSummary` e registram o metadado.
  - **Steppers +/−** nas listas main/egg (miniatura, nome, contador, Remover) e nos resultados da busca; contadores `X/50` e `Y/5`.
  - **Índice de cartas** (`resolveCard`/`maxCountFor`): `Record<cardId, CardSummary>` alimentado ao adicionar + `useQueries` (`cardsApi.getCard`, cache `['card', id]`) p/ ids vindos de import — capa e listas mostram os nomes corretos.
  - **Layout em 2 colunas** responsivo (busca à esquerda; painel do deck/legalidade/capa/ações à direita).
- **Arquivos:** `apps/web/src/features/decks/views/deck-form-view.tsx`, `apps/web/src/features/decks/viewmodels/use-deck-form.ts`, `context/modules/web/status.md`, `context/modules/decks/status.md`.
- **Decisões:** ver handoff da task 72 em `context/modules/web/status.md` (Fase 32). Destaque: constantes de tamanho locais no VM (não importa `@digimon/decks` no client); nenhuma regra de domínio duplicada — a legalidade continua vindo de `POST /decks/legality`.
- **Validações:** `pnpm turbo typecheck lint build --filter=@digimon/app-web` ✅ (0 erros, 0 warnings; build com `/decks/novo`).
- **Fora do escopo (reportar):** `apps/api/**`, `packages/**` e `components/**` intocados. Na ocasião, o wrapper da página (`(member)/decks/novo/page.tsx`: `AuthShell`/card ~420px) não foi alterado — o formulário em 2 colunas herdava a largura do card do shell. **Resolvido na task 75** (`/decks/novo` passou a usar container largo `max-w-[1440px]`, sem o `AuthShell` estreito; ver handoff da 75 em `context/modules/web/status.md`).

### Handoff task 66 (frontend da comunidade de decks)
- **Feito:** frontend da comunidade (feed/curtir/publicar/import/export) consumindo as rotas reais da task 65. MVVM estrito — Model (`community-types`/`community-api`), ViewModels (4 novos + helpers), Views só JSX.
- **Decisões:** contrato dos erros exibido via `error.message` do `ApiError` (envelope `{ error: { code, message, details } }`); like otimista com rollback; "copiar pra mim" cria rascunho próprio + registra cópia; export via `fetch` cru (text/plain).
- **Fora do escopo (reportar):** export da comunidade disponível só ao dono (rota exige slug de origem); `apps/api/**` e `packages/**` intocados.

### Handoff task 65 (rotas Fastify da comunidade de decks)
- **Feito:**
  - **`apps/api/src/routes/community-decks.ts`** (`communityDecksRoutes`): `GET /decks/community` (`sort`|`period`|`colors=a,b`|`q`|`page` → `{ decks, hasMore }`), `GET /decks/community/publications` (`CommunityPublication[]`), `PUT/DELETE /decks/community/publications/:deckId` (publica/despublica; slug do deck), `GET /decks/community/:id` (detalhe; moderação vê hidden), `PUT/DELETE /decks/community/:id/like`, `POST /decks/community/:id/copies` (204), `POST /decks/community/:id/reports` (204), `POST /decks/legality`, `POST /decks/import`, `GET /decks/:slug/export` (text/plain), e admin: `POST /admin/decks/community/:id/moderation`, `GET /admin/decks/community/reports` (`{ decks }`), `GET /admin/decks/community/:id/reports`, `POST /admin/decks/community/:id/reports/dismiss`.
  - **`apps/api/src/container.ts`**: `communityDecksDeps()` instancia os 13 use cases da comunidade (reusando `eventBus`/`prisma` e o `PrismaCardReferenceValidator`) + adapters DIP `PrismaDeckCardResolver`/`PrismaDeckColorResolver` sobre `PrismaCardRepository` (`@digimon/cards`).
  - **`apps/api/src/routes/community-rate-limit.ts`**: token bucket em memória por conta (chave = `request.auth.userId`), capacidades like 30/2s, publish 10/30s, report 5/60s.
  - **`apps/api/src/routes/index.ts`**: registra o plugin.
- **Arquivos:** `apps/api/src/routes/{community-decks.ts,community-rate-limit.ts,index.ts}`, `apps/api/src/container.ts`, `context/modules/decks/status.md`.
- **Decisões:**
  1. **Arquivo novo `community-decks.ts`** (em vez de estender `decks.ts`): mantém o plugin de decks CRUD intocado e evita colisões de path do Fastify (find-my-way prioriza rota estática: `/decks/community` e `/decks/community/publications` vencem `/decks/:slug` e `/decks/community/:id`).
  2. **Erros delegados ao handler global** (padrão da task e das rotas existentes): os códigos do enunciado (`own_deck`, `deck_not_legal`, `too_many_requests`, ...) são a **intenção semântica** do contrato; a resposta concreta segue o envelope do projeto `{ error: { code, message, details } }` (ex.: like do próprio → 403 `FORBIDDEN`; publish ilegal → 422 `VALIDATION_ERROR`; rate limit → 429 `too_many_requests`). Nenhuma regra de domínio foi duplicada para traduzir códigos.
  3. **`:deckId` das publicações é o `slug` do deck**: `Publish/UnpublishDeckFromCommunityUseCase` resolvem por `deck.slug` (o path do enunciado foi mantido literal).
  4. **`GET /decks/community` responde `{ decks, hasMore }`** (contrato literal do item 2 da task), mapeando `CommunityDeckPage.items → decks`; `period` default `week` (enunciado), `page` repassado ao use case (default 1).
  5. **Validação com os schemas Zod do módulo**: `listCommunityDecksSchema`/`reportCommunityDeckSchema`/`communityModerationActionSchema`/`deckCardSchema`; `ZodError` convertido em `ValidationError` (422) numa camada `parseInput` — evita o 500 que o handler global daria a um `ZodError` cru. `POST /decks/import` (não tem schema no módulo) valida `text` manualmente.
  6. **Rate limit por conta é local em `routes/`** (não reusa o limiter por IP de `plugins/rate-limit.ts`, que é por IP), conforme item 5.
- **Validações:** `pnpm turbo typecheck|lint|build --filter=@digimon/app-api` ✅; `pnpm harness check --barrel --db` ✅; smoke `app.inject` ✅ 36/36.
- **Fora do escopo (reportar):** durante o smoke foi necessário aplicar a migration pendente `20261011120000_deckbuild_community` no DB local de dev (`prisma migrate deploy`, aditiva) — o banco estava atrás do schema do repo. `packages/modules/decks/**` e `apps/web/**` **intocados**.

### Handoff task 64 (comunidade de decks — snapshot/feed/likes/cópias/moderação)
- **Feito:**
  - **`domain/community/community-types.ts`**: `CommunityDeckStatus`/`CommunitySort`/`CommunityPeriod`/`CommunityModerationAction`/`CommunityReportReason`, `CommunityDeckSummary`/`CommunityDeck`/`CommunityDeckPage`, `CommunityPublication`, `CommunityDeckReport`, `ReportedCommunityDeck`.
  - **`domain/entities/public-deck.ts`**: `PublicDeck.fromSource(deck, ownerId, { name?, colors, legal })` congela nome/cores/cardList/eggList/coverCardId e zera engajamento; `isOutdated(savedUpdatedAt)`; `refresh(patch)` re-congela e volta a `public`.
  - **`domain/community/deck-name-moderation.ts`**: `reviewDeckName(name) → { allowed, name }` (normaliza espaços, corta em 40, lista simples de termos bloqueados; pura).
  - **`domain/community/community-colors.ts`**: `DeckColorResolver` (DIP) + `dominantColors` (peso = quantidade, até 3, tie-break por nome).
  - **`domain/repositories/public-deck-repository.ts`**: interface DIP com `create/update/findBySourceDeck/findById/list/publications/unpublish/setStatus/like/unlike/addCopy/report/listReports/queueReports/dismissReports`.
  - **`use-cases/community/*`**: `PublishDeckToCommunityUseCase` (lê deck salvo, legalidade + nome + cores; hidden → Conflict; outro dono → NotFound), `UnpublishDeckFromCommunityUseCase`, `ListPublicationsUseCase` (`outdated`), `ListCommunityDecksUseCase` (feed status=public/cores/busca/top|new/página 24 sem total, legalidade re-julgada), `GetCommunityDeckUseCase` (`includeHidden` p/ moderação), `Like/UnlikeCommunityDeckUseCase`, `RecordDeckCopyUseCase`, `ReportCommunityDeckUseCase`, `ModerateCommunityDeckUseCase`, `ListReportedDecks/OpenDeckReports/DismissDeckReportsUseCase`.
  - **`infra/repositories/prisma-public-deck-repository.ts`**: impl Prisma (join `User.name` p/ autor; `array_contains` p/ cor; ranking `top`+período por curtidas recentes via `$queryRaw`).
  - **Eventos** (`deck.publication.*`) + **barrel** + **schemas Zod** (`listCommunityDecksSchema`/`reportCommunityDeckSchema`) + **testes** (26).
- **Arquivos:** `packages/modules/decks/src/**` (domínio comunidade/entidade/repo/use-cases/infra/events/barrel/spec), `context/modules/decks/status.md`.
- **Decisões:**
  1. **`DeckColorResolver` novo DIP** (não estendi `CardReferenceInfo`): evita quebrar `PrismaCardReferenceValidator` do `apps/api` (fora do escopo); impl concreta fica no composition root (lote 5).
  2. **Contadores/status via SQL raw** no repo Prisma (`like/unlike/addCopy/unpublish/setStatus`): preservam `updatedAt` como "último congelamento de conteúdo", garantindo a semântica de `outdated` (likes/moderação não falseiam).
  3. **`fromSource` recebe `name?` opcional** (superset do `{ colors, legal }` da spec) para aplicar o nome já revisado pela moderação; default = `deck.name`.
  4. **`legal` no factory é invariante** (defense in depth): `fromSource` rejeita deck ilegal além da validação no use case.
  5. **Erros semânticos**: deck de outro dono/inexistente → `NotFoundError` (não vaza existência); publicação `hidden` ao re-publicar → `ConflictError`; moderação exige `administrator|editor` (`requireManager` compartilhado em `domain/actor.ts`).
  6. **`period` (top) = janela de curtidas recentes** (`since` = 7/30 dias), não janela de publicação — conforme "likes recentes por período".
  7. **Cópia não emite evento** (spec lista 5 eventos; cópia só atualiza contador).
- **Validações:** `pnpm turbo typecheck` ✅ (12 pacotes), `pnpm --filter @digimon/decks lint` ✅, `pnpm --filter @digimon/decks test` ✅ 80 passed (26 novos).
- **Fora do escopo (reportar):** `apps/api/**` e `apps/web/**` intocados (wiring das rotas = lote 5/6).

### Handoff task 63 (import/export de decklist)
- **Feito:**
  - **`domain/deck-list/types.ts`**: `DeckCardResolver` (DIP: `resolveByNumber`/`resolveById`), `ResolvedDeckCard` (`cardId`/`number`/`name`/`isDigiEgg`/`maxCountInDeck?`), `DeckListParseResult` (`cardList`/`eggList`/`skipped`/`trimmed`), `SerializableDeckList`.
  - **`domain/deck-list/parse-deck-list.ts`**: `parseDeckList(text, resolver)` — detecta TTS (inicia com `[` ou com strings entre aspas + vírgulas) vs lista de texto; regex `/\b([A-Z]{1,3}\d{0,2}-\d{2,3})(?:_(P\d+))?\b/gi`; contagem por prefixo/sufixo/`4x`/`x4` (default 1); ignora `//`, `#`, vazias e linhas sem código; TTS = uma cópia por item (tolerante a colchete faltando via extração de strings); `normalizeCardNumber` (uppercase + remove zeros à esquerda do set, `ST01-01`→`ST1-01`); resolve via resolver, separa egg/main, aplica limite por carta e caps de zona; retorna `skipped`/`trimmed`.
  - **`domain/deck-list/serialize-deck-list.ts`**: `serializeDeckList(deck, resolver)` — cabeçalho `// DigimonCard.io Deck List`, egg antes do main, agrupa por cardId, ordena por número (set + número natural), linhas `<qty> <name> <number>`; fallback `cardId` quando não resolvido.
  - **`domain/deck-sizes.ts`**: `MAIN_DECK_SIZE`/`EGG_DECK_SIZE`/`DEFAULT_MAX_COUNT_IN_DECK` movidos para o domínio (evita `domain → use-cases`); `CheckDeckLegalityUseCase` importa e **re-exporta** (barrel estável).
  - **Barrel**: exporta `parseDeckList`, `normalizeCardNumber`, `serializeDeckList` e os tipos do import/export.
- **Arquivos:** `packages/modules/decks/src/domain/deck-sizes.ts`, `.../domain/deck-list/{types,parse-deck-list,serialize-deck-list,deck-list.spec}.ts`, `.../use-cases/check-deck-legality.ts`, `.../src/index.ts`, `context/modules/decks/status.md`.
- **Decisões:**
  1. **`DeckCardResolver` ganhou `resolveById` + `name`/`number`** (superset da interface da spec, que previa só `resolveByNumber`/`{cardId,isDigiEgg}`): necessário para a serialização (`<qty> <name> <number>`) e para o round-trip. `resolveByNumber` continua retornando algo estruturalmente compatível com `{cardId,isDigiEgg}`.
  2. **Funções puras + resolver no barrel** (item 3 da task era opcional): **não** criados `ImportDeckListUseCase`/`ExportDeckListUseCase` — o parse/serialize não persiste; os use cases só teriam abstracção sem valor agora. Plug do resolvedor concreto (Prisma/@digimon/cards) fica nas rotas (lotes 5/6).
  3. **Constantes de tamanho movidas para `domain/deck-sizes.ts`** — fonte única; `check-deck-legality` re-exporta para não quebrar o barrel.
  4. **Caps**: limite por carta (`maxCountInDeck`, default 4) aplicado antes do cap de zona (main 50 / egg 5); excedentes acumulados em `trimmed`. Desconhecidas em `skipped` (não entram em `trimmed`).
  5. **TTS sem sufixo `_P1`**: sufixo de arte é removido para resolver a carta (não persistido) — a spec não exige guardá-lo e nenhum consumidor o usa ainda.
- **Validações:** `pnpm turbo typecheck|lint|test --filter=@digimon/decks` ✅ (54 testes, 17 novos).
- **Fora do escopo (reportar):** `apps/api/**` e `apps/web/**` intocados.

### Handoff task 62 (modelo de lista dupla + legalidade de composição)
- **Feito:**
  - **Entidade `Deck`**: `eggList: DeckCardEntry[]` + `coverCardId: string | null` em `DeckData`/`CreateDeckData`/`UpdateDeckData`; `assertValidCardList` agora valida cardList E eggList (cardId não-vazio, quantidade inteira ≥1); `update` propaga os dois campos.
  - **`PrismaDeckRepository`**: persiste/lê `eggList` (JSON) e `coverCardId` (nullable) em `create`/`update`/`mapToDomain`.
  - **Schemas Zod**: `createDeckSchema` aceita `eggList` (default `[]`) e `coverCardId` (nullable/opcional); `updateDeckSchema` aceita ambos opcionais (patch parcial). `CreateDeckInput` passou a ser `z.input` (wire) — `eggList` opcional no corpo, defaultado pelo schema.
  - **Use cases Create/Update**: propagam `eggList`/`coverCardId`; `assertCardsExist` roda também sobre a `eggList`.
  - **`CardReferenceValidator`**: novo `inspect(entries): Promise<CardReferenceInfo[]>` (`{ cardId, quantity, exists, maxCountInDeck, isDigiEgg }`), mantendo `assertCardsExist`. `PrismaCardReferenceValidator` (container) implementa `inspect` (select `id,type,maxCountInDeck`; `isDigiEgg = type === 'DIGIEGG'`).
  - **`CheckDeckLegalityUseCase`** (`use-cases/check-deck-legality.ts`): usa `inspect` → `{ legal, mainCount, eggCount, violations }`. Regras: main exatamente 50; egg ≤ 5; cópia ≤ `maxCountInDeck` (default 4) somando main+egg; `unknown_card`; `wrong_zone` (Digi-Egg só na eggList, não-Digi-Egg só no cardList).
  - **`PublishDeckUseCase`**: exige deck **legal** (delega ao `CheckDeckLegalityUseCase`) além de ter cartas; override admin de delete/list intacto.
  - **Barrel**: exporta `CheckDeckLegalityUseCase`, constantes (`MAIN_DECK_SIZE`/`EGG_DECK_SIZE`/`DEFAULT_MAX_COUNT_IN_DECK`), tipos de legalidade e `CardReferenceInfo`.
  - **Rotas API** (`apps/api/src/routes/decks.ts`): `DeckDTO`/`serializeDeck` expõem `eggList`/`coverCardId` (round-trip via `GET /decks/:slug`).
  - **`decksDeps()`** (container): instancia `CheckDeckLegalityUseCase` e injeta no `PublishDeckUseCase`; expõe `checkLegality`.
  - **`CopyDeckUseCase`**: cópia passa a incluir `eggList`/`coverCardId` (necessário por `Deck.create`).
- **Arquivos:** `packages/modules/decks/**` (entity, repo interface/impl, schemas, create/update/publish/copy, novo check-deck-legality, barrel, spec), `apps/api/src/container.ts`, `apps/api/src/routes/decks.ts`, `context/modules/decks/status.md`.
- **Decisões:**
  1. **`Create` NÃO valida legalidade** (apenas `Publish`), conforme spec #7 — criar como `published` direto segue a regra antiga (≥1 carta). Enforce de legalidade no create fica para task futura se desejado.
  2. **`eggList` no update é opcional sem default** (preserva patch parcial: editar só o nome não zera a eggList). No create usa `z.input` no tipo de entrada para manter `eggList` opcional no wire com default `[]`.
  3. **`copy` inclui eggList/coverCardId** — a cópia reflete a composição completa do deck de origem.
  4. **Limite de cópias somado main+egg** por `cardId`; cartas inexistentes não entram no cálculo de cópia (já reportadas como `unknown_card`).
- **Validações:** `pnpm turbo typecheck|lint|test --filter=@digimon/decks` ✅ (37 testes, 11 novos); `pnpm turbo typecheck|lint --filter=@digimon/app-api` ✅.
- **Fora do escopo (reportar):** `apps/api/src/routes/cards.ts` e `packages/modules/cards/**` (task 61 ativa) intocados.

### Handoff task 41 (rotas de decks na API)
- **Feito:** porte dos route handlers de decks (`/api/decks/**` e `/api/admin/decks/**`) para um único plugin Fastify em `apps/api/src/routes/decks.ts`: `GET/POST /decks`, `GET/PATCH/DELETE /decks/:slug`, `POST /decks/:slug/{publish,copy}`, `GET /admin/decks` (administrator|editor), `DELETE /admin/decks/:slug` (administrator). Sessão reusa `authenticate`/`requireRoleHook`/`getAuthContext` (plugins) — os handlers públicos (`GET /decks`, `GET /decks/:slug`) usam ator opcional (paridade com `_lib/session.ts`).
- **Arquivos:** `apps/api/src/routes/decks.ts`, `context/modules/decks/status.md`.
- **Decisões:**
  1. **Composição inline (container não estendido):** o `apps/api/src/container.ts` (fora do escopo desta task) não expõe deps de decks; a composição (`PrismaDeckRepository`, `PrismaCardReferenceValidator`, 7 use cases) vive no próprio arquivo de rota, reusando o `eventBus` exportado pelo container e o `prisma` singleton. Nenhuma regra de domínio duplicada. Se o padrão desejado for `decksDeps()` no container, extrair depois (task própria).
  2. **Erros delegados ao handler global** (`AppError → { error: { code, message, details } }`), em vez do `toErrorResponse` interno do web — mesmo contrato, seguindo o padrão das rotas de auth (task 36).
  3. **`parseListInput`** replica o parse de query do web (`listDecksSchema.parse` + `queryString('' → undefined)`), garantindo `page/pageSize` coercidos e filtros opcionais.
  4. Serialização portada (`serializeDeck`/`serializeSummary`/`serializeList`) inline — resumo da listagem sem `cardList`/`description`.
- **Validações:** `pnpm turbo typecheck|lint|build --filter=@digimon/app-api` ✅; `pnpm harness check --barrel --db` ✅; smoke `app.inject` ✅ (publish/copy não exercitados no smoke por não haver cartas no catálogo local — cobertos pelos 26 testes de domínio).
- **Fora do escopo (reportar):** `apps/web/**` intocado; `apps/api/src/container.ts` intocado.

### Handoff task 16 (rota admin de decks)
- **Override admin no domínio (defense in depth):** `DeleteDeckUseCase.execute` autoriza delete se `actor.role === 'administrator' || 'editor'` OU `requireOwner(actor, deck.ownerId)` — a rota admin também exige o papel, mas a regra vive no use case (nenhum caller "comum" consegue escalar privilégio).
- **Listagem admin:** `ListDecksUseCase` passa a distinguir 3 caminhos — `mine` (dono, qualquer status), manager (admin/editor, TODOS os status/visibilidade, com filtro opcional) e público (published E isPublic, comportamento inalterado).
- **Rotas novas:** `GET /api/admin/decks` (exige administrator|editor; reusa `ListDecksUseCase` + `_lib` de `api/decks`) e `DELETE /api/admin/decks/:slug` (exige administrator; reusa `DeleteDeckUseCase`). Sem `new PrismaClient` — DIP via container `api/decks/_lib/container.ts`.
- **Feature admin sem fallback:** `adminDecksApi` → `/api/admin/decks` + `/api/admin/decks/:slug` (DELETE); `useAdminDecks` ganhou `status` filter (`AdminStatusFilter = 'all' | DeckStatus`) e trocou `currentUserId` por `currentRole` (perfil `/me`); `AdminDecksView` mostra filtros Todos/Rascunhos/Publicados, badge "Unlisted" e botão Excluir apenas para administrator.
- **Testes (deck-workflow.spec.ts, 22 → 26):** admin deleta deck de outro ✅; editor deleta deck de outro ✅; admin vê rascunhos/unlisted ✅; editor vê todos e filtra por status ✅; member não-dono continua ForbiddenError ✅ (teste existente mantido).
- **Barrel `packages/modules/decks/src/index.ts`:** sem mudança necessária — as formas de `DeleteDeckCommand`/`ListDecksCommand` não mudaram (nenhum símbolo novo).

### Decisões (task 16)
- Override admin implementado **inline nos use cases** (`MANAGER_ROLES: readonly Role[] = ['administrator', 'editor']` + `isManager`) em vez de no `domain/actor.ts` (padrão do módulo tournaments) porque `actor.ts` está fora do `## Escopo` — "ajuste mínimo" conforme a spec.
- `GET /api/admin/decks` exige administrator|editor (mesmo gate do layout admin); `DELETE` exige apenas administrator (spec): editor vê a agenda completa mas não exclui (UI oculta o botão; backend revalida 403).
- Rotas admin reutilizam `_lib/{handlers,serialize,container,session}` de `api/decks` (mesmo padrão de `api/cards/admin` → `api/cards/_lib`) — sem duplicação de composition root.
- Admin vê "todos" (sem default de status) quando não filtra — diferente do padrão tournaments que faz default `published` para editorial.

### Pendências
- [x] Testes de integração com Postgres real — task 97 (`src/test/decks.integration.spec.ts`, gated por `TEST_DATABASE_URL`; 9 testes cobrindo CRUD/egg/capa + comunidade transacional)
- [ ] `admin/decks` segue com a view sem fallback por autoria — validar visualmente no painel (rotas reais exigem sessão admin/editor)

### Histórico (task 06 + task 13)
- **Task 06 (módulo decks):** Migration `20260930180000_decks` (fluxo seguro: migrate diff + psql + registro em `_prisma_migrations`) — tabelas `decks` e `deck_copies` + enum `DeckStatus` + índice GIN `decks_search_idx` (ADR-003); `prisma migrate status` = up to date. Rotas API: `GET/POST /api/decks`, `GET/PATCH/DELETE /api/decks/:slug`, `POST /api/decks/:slug/publish`, `POST /api/decks/:slug/copy`, `GET /api/decks?mine=true`. UI MVVM: model (types + decks-api), viewmodels (list, detail, form, actions), views (lista com DeckCard + copiar, form com salvar/publicar, detalhe com cardList). CardReferenceValidator implementado no composition root (apps/web) via Prisma — valida existência das cartas do cardList contra a tabela `cards`. Adicionada dependência `@digimon/decks` em `apps/web/package.json` (necessária aos route handlers; segue o padrão das tasks 05/07). Barrel export do módulo e do `@digimon/database` (Deck, DeckCopy, DeckStatus) atualizados. `.gitkeep` antigo de `features/decks` mantido (baseline).
- **Task 13 (páginas decks):** `(public)/decks` — `DecksListView` virou grid responsivo (1-col mobile → 2/3/4-col desktop) com `DeckCard` + ícone de copiar direto no card (via `onCopy`), estados loading/erro/vazio e botão "+ Novo deck" (headerAction → `/decks/novo`). `(member)/decks/novo` — `DeckFormView` ganhou busca de cartas do catálogo (reusa `useCardList` da feature cards; resultados com "Adicionar" alimentam o cardList via `addCard(card.id)`), mantendo nome/slug/formato/descrição + salvar/publicar. Página monta `AuthShell` + `AuthBenefits` (layout do design "Criar deck": card 420px + painel). **Decisão:** busca de cartas usa `useCardList` (ViewModel de outra feature — consumo de ViewModel entre features é permitido; Model não foi duplicado).

### Decisões (histórico task 06)
- `/me/decks` (spec original) implementado como `GET /api/decks?mine=true` para respeitar o escopo `apps/web/src/app/api/decks/**` (mesma decisão do módulo tournaments)
- Frontend NÃO importa `@digimon/decks` no client (evita arrastar `@digimon/database` ao bundle) — tipos literais mantidos em sync (mesma decisão das features content/tournaments)
- Member publica deck direto (status `published` no create ou via publish) conforme spec; publicar exige ao menos uma carta no cardList
- Deck copiado vira **rascunho** do copiador (nunca publicado automaticamente); slug único gerado com sufixo numérico em colisão
- Deck `unlisted` (published + isPublic=false) não aparece na listagem pública nem é legível por outros — visível só ao dono