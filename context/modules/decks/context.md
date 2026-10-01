# @digimon/decks — Contexto do Módulo

## Responsabilidade
Deckbuilder: montar, salvar, copiar e compartilhar decks. **Colaborativo** — Member publica decks próprios direto (sem revisão), pode copiar decks de outros.

## Entidades
- **Deck** — id, slug, name, ownerId (createdBy), description, cardList (JSON: cardId + quantity), format, status (draft | published), isPublic, createdAt, updatedAt
- **DeckCopy** — registro de cópia (deck → copiado por outro usuário)

## Use Cases
- `CreateDeckUseCase` — Member cria deck (draft ou published direto)
- `UpdateDeckUseCase` — dono edita deck próprio
- `PublishDeckUseCase` — publica direto (sem revisão)
- `DeleteDeckUseCase` — dono remove deck próprio
- `GetDeckUseCase` — leitura pública de deck publicado
- `ListDecksUseCase` — listagem/busca pública (full-text)
- `CopyDeckUseCase` — copia deck de outro usuário (novo deck do copiador)

## Eventos que Publica
- `deck.created`, `deck.updated`, `deck.published`, `deck.copied`

## Eventos que Consome
- Nenhum

## Dependências
- `@digimon/contracts` (tipos, erros, eventos, EventBus)

## Repositórios
- `IDeckRepository`
- `CardReferenceValidator` (interface — valida cardList contra as Cartas de @digimon/cards; implementação vive no composition root do apps/web)

## Rotas HTTP (apps/web)
- `GET /api/decks` — listagem pública (somente published E isPublic); `?mine=true` lista os decks do próprio Member (qualquer status); filtros: `search` (full-text no nome), `format`, `page`, `pageSize`
- `POST /api/decks` — criar (Member autenticado; draft ou published direto)
- `GET /api/decks/:slug` — detalhe público (rascunho/unlisted só dono — NotFound sem vazar)
- `PATCH /api/decks/:slug` — editar (somente dono; Member NÃO edita deck de outro)
- `DELETE /api/decks/:slug` — remover (somente dono)
- `POST /api/decks/:slug/publish` — publicar direto (somente dono)
- `POST /api/decks/:slug/copy` — copiar (Member autenticado; vira deck próprio)

## Regras
- **Member publica decks próprios direto** — sem workflow de revisão
- Member NÃO edita decks de outros; pode **copiar** (vira deck próprio)
- cardList referenciam Cartas do @digimon/cards (validação de existência/quantidade)
- Decks publicados são públicos; rascunhos visíveis só ao dono