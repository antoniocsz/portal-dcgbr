# @digimon/decks — Status

## Fase 1 — Fundação
- [x] Domain entities (Deck + DeckCopy + slugify + invariantes)
- [x] Repository interfaces (DeckRepository + CardReferenceValidator — DIP)
- [x] Use cases (DIP): create / update / publish / delete / get / list / copy
- [x] Implementação Prisma (PrismaDeckRepository)
- [x] Testes unitários (deck-workflow.spec.ts — 22 testes)
- [ ] Testes de integração (pendente: exigem Postgres real; cobertos pelos testes de domínio + rotas + smoke test)

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

## Handoff

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
- **Fora do escopo (reportar):** `apps/api/**`, `packages/**` e `components/**` intocados. O wrapper da página (`(member)/decks/novo/page.tsx`: `AuthShell`/card ~420px) não foi alterado — o formulário em 2 colunas herda a largura do card do shell.

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
- [ ] Testes de integração com Postgres real (não cobertos nesta task; cobertos pelos testes de domínio + rotas + smoke test)
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