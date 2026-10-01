# @digimon/cards — Contexto do Módulo

## Responsabilidade
Card database do Digimon TCG (base de referência: digimoncard.dev). Catálogo público de cartas — fonte para matérias, decks e comentários. **Pós-MVP** (cards → decks → torneios).

## Entidades
- **Card** — id, dcgId (id oficial), name, number, rarity, color(s), type (digimon | option | tamer), level, digiType, attribute, dp, playCost, evolutionConditions, effects, imageUrl, set/series, releaseDate, updatedAt
- **CardSet** — id, name, code, releaseDate (séries/expansões)

## Use Cases
- `ImportCardsUseCase` — importação/curadoria do card database (admin; fonte externa)
- `GetCardUseCase` — ficha da carta por id/number
- `ListCardsUseCase` — busca com filtros (nome, cor, tipo, custo, set) + **full-text search** (Postgres)
- `ListSetsUseCase` — séries/expansões

## Eventos que Publica
- `card.imported`, `card.updated`

## Eventos que Consome
- Nenhum

## Dependências
- `@digimon/contracts` (tipos, erros, eventos, EventBus)

## Repositórios
- `CardRepository` (create/update/findById/findByDcgId/findByNumber/search)
- `CardSetRepository` (upsert/findByCode/list)

## Rotas (apps/web, route handlers)
- `GET /api/cards` — listagem pública (filtros: search, type, color, playCost, setCode + paginação)
- `GET /api/cards/sets` — séries/expansões (público)
- `GET /api/cards/:id` — ficha pública (aceita id interno ou dcgId; `?number=` busca por número)
- `POST /api/cards/admin/import` — importação/curadoria (administrator)

## Implementação (task 05)
- Tipos `CardType`/`CardColor` vivem no domínio do módulo (`@digimon/cards`), não em `@digimon/contracts`.
- `Card.setCode` é string nullable (sem FK para `card_sets`) — importar cartas não exige o set antes;
  o payload de import aceita `sets?` para popular `card_sets`.
- `evolutionConditions` é `Json` (default `[]`).
- Full-text: índice GIN funcional `cards_search_idx` sobre `to_tsvector('simple', name || ' ' || effects)`.

## Regras
- Busca via full-text do Postgres (sem engine externa)
- Catálogo público: leitura liberada, escrita somente admin/curadoria
- Referência de dados: digimoncard.dev (importação inicial + atualizações)
- Cards referenciados por decks (via ID) e comentários (targetType=card)
- Importação rejeita `dcgId` duplicado dentro do lote; reimportar um `dcgId` existente atualiza a carta (`card.updated`)