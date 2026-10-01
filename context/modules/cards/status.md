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

## Handoff
- **Task 13 (páginas cartas):** `(public)/cartas` (Card Database: busca + filtros cor/tipo + grid 2-col mobile / 4-col desktop + paginação) e `(public)/cartas/[id]` (Ficha da Carta fiel ao design: carta grande com cor do atributo, chips de cor/tipo, grid de stats, efeito, set e cadeia de digievolução; `generateMetadata` SSR busca a carta na API). `admin/cartas` (catálogo paginado com filtros + painel de importação JSON via `POST /api/cards/admin/import`; editor vê catálogo, só administrator importa — backend revalida). Features cards evoluídas: `useCardList` ganhou paginação (`page`/`totalPages`/`setPage`, filtro reseta p/ pág. 1); `CardsGrid` ganhou link para a ficha + controles de paginação; `card-view.ts` expõe `CardDetailView` enriquecido (chips, evolutionConditions, attributeHex); `cards-api` ganhou `importCards`; novos `useAdminCards` + `AdminCardsView`. Barrels atualizados.
- **Decisões:** (1) `CardTileData` (components) não ganhou `id` — o `CardsGrid` recebe `GridCard = CardTileData & { id }` (cards-grid é da feature, dentro do escopo). (2) A "cadeia de evolução" da ficha renderiza `evolutionConditions` (condições de digievolução PARA a carta) como nós Lv./cor/custo — o modelo não tem os estágios seguintes (Agumon→Greymon do design) para montar a cadeia ascendente. (3) Admin de cartas em `app/admin/cartas` (design "Admin — Cartas"); o link de importação aparecerá só para administrator.
- **Fora do escopo (reportar):** o `AdminShell` (features/admin) não lista as novas rotas `admin/cartas` e `admin/torneios` na sidebar — adicionar itens exigiria tocar em `features/admin` (fora do `## Escopo`); agendar/ampliar escopo para incluir os links.
- **Task 05 (módulo cards):** criado o pacote `@digimon/cards` (domain + use-cases + infra + barrel) seguindo o mesmo padrão de `@digimon/content`/`@digimon/comments`. Entidades `Card`/`CardSet` com invariantes no domínio; repositórios por interface (DIP); implementações Prisma. `ImportCardsUseCase` é admin-only (`requireCurator`), rejeita dcgId duplicado **dentro do lote** (`ValidationError`) e, ao reimportar um dcgId existente, atualiza a carta e publica `card.updated` (importação inicial publica `card.imported`). `ListCardsUseCase` é público com filtros (type/color/playCost/setCode) + busca full-text resolvida no repositório. Rotas: `GET /api/cards` (público), `GET /api/cards/sets`, `GET /api/cards/:id` (aceita `?number=`), `POST /api/cards/admin/import` (admin). UI MVVM em `features/cards` (model/viewmodels/views), reutilizando `CardTile` do design system.
- **Migration:** `packages/database/prisma/migrations/20260930160854_cards` (enums `CardType`/`CardColor`, tabelas `cards`/`card_sets`, unique `dcgId`/`code`) + índice GIN de full-text `cards_search_idx` (adicionado manualmente à migration, aplicado com sucesso em localhost:5432).
- **Decisões (task 05):** (1) `CardType`/`CardColor` definidos no domínio do módulo (não em `@digimon/contracts`) — são específicos do card database; `@digimon/contracts` já cobre `CommentTargetType='card'`. (2) `Card.setCode` é string nullable sem FK para `card_sets` — a importação de cartas não exige que o set exista antes; `sets` opcional no payload de import popula `card_sets`. (3) `evolutionConditions` persistido como `Json` (default `[]`), nunca null. (4) Índice GIN funcional (não coluna gerada) — a query usa expressão idêntica à do índice.
- **Pendências (task 05):** importação real da base digimoncard.dev; testes de integração com Postgres.
