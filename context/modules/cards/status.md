# @digimon/cards — Status

## Fase 1 — Fundação (task 05-module-cards)
- [x] Pacote `@digimon/cards` criado (domain + use-cases + infra + barrel)
- [x] Entidade `Card` (dcgId único, name, number, rarity, type, colors[], level, digiType, attribute, dp, playCost, evolutionConditions, effects, imageUrl, setCode, releaseDate)
- [x] Entidade `CardSet` (code único, name, releaseDate)
- [x] Interfaces `CardRepository` + `CardSetRepository` (DIP)
- [x] Use cases: ImportCards, GetCard, ListCards (filtros + full-text), ListSets
- [x] Implementação Prisma: `PrismaCardRepository` + `PrismaCardSetRepository` (mapeia enums Prisma ↔ domínio)
- [x] Busca full-text no Postgres (`to_tsvector`/`plainto_tsquery`, config `simple`) + índice GIN `cards_search_idx`
- [x] Eventos `card.imported` / `card.updated` via EventBus (`@digimon/contracts`)
- [x] Testes unitários (10): full-text por nome/efeito; filtros combinados (cor, tipo, custo, set); duplicata de dcgId no lote; reimportação atualiza; leitura pública; escrita só admin
- [x] Route handlers `apps/web/src/app/api/cards/**` (público + admin)
- [x] UI MVVM estrito em `apps/web/src/features/cards/**` (model + viewmodels + views)
- [x] Barrel export atualizado
- [x] Schema Prisma + migration `20260930160854_cards` aplicada
- [x] Typecheck: `pnpm turbo typecheck --filter=@digimon/cards` passando
- [x] Lint passando (cards e arquivos cards do web)

## Fase 2 — Refinamentos
- [ ] Importação real da base digimoncard.dev (adapter de fonte externa / job)
- [ ] Testes de integração com Postgres real (full-text + índice GIN)
- [x] Página pública do catálogo (`app/(public)/cartas`) — task 13-frontend-cards-decks-torneios
- [x] Ficha da carta (`app/(public)/cartas/[id]`) — task 13
- [x] Painel admin de cartas (`app/admin/cartas`) com importação — task 13
- [x] Rotas portadas para `apps/api` (Fastify, ADR-007): `GET /cards`, `GET /cards/sets`, `GET /cards/:id`, `POST /cards/admin/import` — task 40

## Handoff
- **Task 40 (rotas cards na API):** portados os route handlers de `apps/web/src/app/api/cards/**` para `apps/api/src/routes/cards.ts` (Fastify), reusando os use cases de `@digimon/cards` + o composition root da API (`eventBus` de `apps/api/src/container.ts`) e a camada de sessão (`getAuthContext` + `requireRole`). Rotas: `GET /cards` (filtros `search/type/color/playCost/setCode` + `page/pageSize` via `listCardsSchema`), `GET /cards/sets`, `GET /cards/:id` (aceita id ou dcgId; `?number=` por número), `POST /cards/admin/import` (administrator). Serialização `Date → ISO` (DTOs) e erros delegados ao handler global (`AppError` → `{ error: { code, message, details } }`). Validado via `node dist/index.mjs` + HTTP: `/cards` 200, `/cards/sets` 200, `/cards/:id` missing 404 `NOT_FOUND`, import sem auth 401 `UNAUTHORIZED`, member 403 `FORBIDDEN`, admin 201 `{ imported, updated, sets }`, reimport `updated:1`, ficha por dcgId 200. Typecheck + lint + build `@digimon/app-api` e `harness check --barrel --db` ok.
- **Decisões (task 40):** (1) Sem helper compartilhado de serialização — as DTOs/`serialize*` de `apps/web/src/app/api/cards/_lib/serialize.ts` foram portadas para dentro de `cards.ts` (strangler: `apps/api` não importa `apps/web`; `## Escopo` restrito a um arquivo). (2) Autorização do import via helper local `requireAdminActor` (porte de `requireAdminUser`: `getAuthContext` → 401 + `requireRole(…, 'administrator')` → 403) em vez dos hooks `authenticate`/`requireRoleHook`, para extrair o `CardActor` sem código defensivo. (3) Plugins de rota registrados sem prefixo (padrão do `routes/index.ts`).
- **Fora do escopo (reportar):** `apps/web/**` intocado (web segue com os handlers originais); `apps/api/src/container.ts` intocado (`cards.ts` monta os repositórios Prisma localmente, como o `_lib/container.ts` do web).
- **Task 13 (páginas cartas):** `(public)/cartas` (Card Database: busca + filtros cor/tipo + grid 2-col mobile / 4-col desktop + paginação) e `(public)/cartas/[id]` (Ficha da Carta fiel ao design: carta grande com cor do atributo, chips de cor/tipo, grid de stats, efeito, set e cadeia de digievolução; `generateMetadata` SSR busca a carta na API). `admin/cartas` (catálogo paginado com filtros + painel de importação JSON via `POST /api/cards/admin/import`; editor vê catálogo, só administrator importa — backend revalida). Features cards evoluídas: `useCardList` ganhou paginação (`page`/`totalPages`/`setPage`, filtro reseta p/ pág. 1); `CardsGrid` ganhou link para a ficha + controles de paginação; `card-view.ts` expõe `CardDetailView` enriquecido (chips, evolutionConditions, attributeHex); `cards-api` ganhou `importCards`; novos `useAdminCards` + `AdminCardsView`. Barrels atualizados.
- **Decisões:** (1) `CardTileData` (components) não ganhou `id` — o `CardsGrid` recebe `GridCard = CardTileData & { id }` (cards-grid é da feature, dentro do escopo). (2) A "cadeia de evolução" da ficha renderiza `evolutionConditions` (condições de digievolução PARA a carta) como nós Lv./cor/custo — o modelo não tem os estágios seguintes (Agumon→Greymon do design) para montar a cadeia ascendente. (3) Admin de cartas em `app/admin/cartas` (design "Admin — Cartas"); o link de importação aparecerá só para administrator.
- **Fora do escopo (reportar):** o `AdminShell` (features/admin) não lista as novas rotas `admin/cartas` e `admin/torneios` na sidebar — adicionar itens exigiria tocar em `features/admin` (fora do `## Escopo`); agendar/ampliar escopo para incluir os links.
- **Task 05 (módulo cards):** criado o pacote `@digimon/cards` (domain + use-cases + infra + barrel) seguindo o mesmo padrão de `@digimon/content`/`@digimon/comments`. Entidades `Card`/`CardSet` com invariantes no domínio; repositórios por interface (DIP); implementações Prisma. `ImportCardsUseCase` é admin-only (`requireCurator`), rejeita dcgId duplicado **dentro do lote** (`ValidationError`) e, ao reimportar um dcgId existente, atualiza a carta e publica `card.updated` (importação inicial publica `card.imported`). `ListCardsUseCase` é público com filtros (type/color/playCost/setCode) + busca full-text resolvida no repositório. Rotas: `GET /api/cards` (público), `GET /api/cards/sets`, `GET /api/cards/:id` (aceita `?number=`), `POST /api/cards/admin/import` (admin). UI MVVM em `features/cards` (model/viewmodels/views), reutilizando `CardTile` do design system.
- **Migration:** `packages/database/prisma/migrations/20260930160854_cards` (enums `CardType`/`CardColor`, tabelas `cards`/`card_sets`, unique `dcgId`/`code`) + índice GIN de full-text `cards_search_idx` (adicionado manualmente à migration, aplicado com sucesso em localhost:5432).
- **Decisões (task 05):** (1) `CardType`/`CardColor` definidos no domínio do módulo (não em `@digimon/contracts`) — são específicos do card database; `@digimon/contracts` já cobre `CommentTargetType='card'`. (2) `Card.setCode` é string nullable sem FK para `card_sets` — a importação de cartas não exige que o set exista antes; `sets` opcional no payload de import popula `card_sets`. (3) `evolutionConditions` persistido como `Json` (default `[]`), nunca null. (4) Índice GIN funcional (não coluna gerada) — a query usa expressão idêntica à do índice.
- **Pendências (task 05):** importação real da base digimoncard.dev; testes de integração com Postgres.
