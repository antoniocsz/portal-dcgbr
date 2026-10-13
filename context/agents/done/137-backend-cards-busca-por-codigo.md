# Task: backend — busca de cartas por código da carta e da coleção
## Agente: `agente-backend`
## Módulo: `packages/modules/cards`
## Escopo (arquivos que esta task vai tocar):
- `packages/modules/cards/src/infra/repositories/prisma-card-repository.ts`
- `packages/modules/cards/src/test/cards.integration.spec.ts`
## Depende de: [ ] —
## Contexto para ler: context/modules/cards/context.md, context/modules/cards/status.md, context/project/adr/ (ADR-003 FTS)
## Skills a carregar: codegen.md + backend.md + data.md
## Pedido do usuário:
"No input de busca, na parte de buscar carta do criar deck, ele também aceita fazer a busca pelo código da coleção e da carta."
## Diagnóstico:
- `PrismaCardRepository.search` usa FTS (ADR-003): `to_tsvector('simple', "name" || ' ' || coalesce("effects",'')) @@ plainto_tsquery('simple', $search)`, com índice GIN `cards_search_idx` **construído sobre essa expressão exata**.
- Isso **não** casa com `number` (código da carta, ex. `BT1-001`) nem `setCode` (código da coleção, ex. `BT1`) — ver `Card.number`/`Card.setCode` no schema.
## Especificação:
1. Estender `search` para também casar `number` e `setCode`, mantendo o FTS de nome/efeitos e a ordenação por relevância. Sugestão: OR com match normalizado — comparar ignorando hífen/espaço (ex.: `BT1-001` ≡ `BT1 001` ≡ `bt1001`) para o usuário poder digitar "BT1" ou "BT1-001"; dar **prioridade** aos matches de código (exact/prefixo) na ordenação, depois o rank do FTS.
2. **Não** alterar a expressão do `to_tsvector` (o índice GIN depende dela) — evita migration desnecessária. `setCode` já tem índice (`cards_setCode_idx`).
3. Manter os demais filtros (`type`, `color`, `playCost`, `setCode`) e o shape de retorno `PaginatedResult<Card>`.
4. Adicionar/ajustar testes cobrindo: busca por número exato (`BT1-001`), por prefixo/normalizado (`bt1001`, `BT1 001`), por `setCode` (`BT1` retorna todas as cartas do set) e busca textual por nome/efeito (não regressão).
## Critério de conclusão:
- [ ] `GET /cards?search=BT1-001` e `?search=BT1` retornam as cartas corretas
- [ ] Busca por nome/efeito continua funcionando (sem regressão)
- [ ] Testes do módulo cards passando
- [ ] `pnpm turbo typecheck` passando (api + módulo)
- [ ] `git diff` restrito ao `## Escopo`
## Ao terminar: atualizar `context/modules/cards/status.md`, rodar `pnpm harness finish 137` e registrar o handoff
## Complexidade: média

## Baseline (git)
- context/agents/active/135-backend-torneios-agenda-status-publica.md
- context/agents/active/136-web-torneios-filtros-funcionais.md
- context/agents/queue/137-backend-cards-busca-por-codigo.md
- context/agents/queue/138-web-cards-busca-placeholder-codigo.md
