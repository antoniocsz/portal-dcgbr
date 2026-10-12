# Task: testes de integração com Postgres real (cards + decks)
## Agente: `agente-backend`
## Módulo: `packages/modules/cards`
## Escopo (arquivos que esta task vai tocar):
- `packages/modules/cards/src/test/**`
- `packages/modules/decks/src/test/**`
## Depende de: [ ] `60-backend-database-schema-deckbuild-community.md`, `82-cards-filtro-custo-faixa.md`
## Contexto para ler: context/modules/cards/status.md, context/modules/decks/status.md, packages/database/src/client.ts
## Skills a carregar: codegen.md + backend.md + data.md + testing.md
## Pendência (dívida antiga, documentada em cards/status.md e decks/status.md):
Não há **testes de integração com Postgres real** — hoje só há testes de domínio com repositórios em memória. Os comportamentos que dependem do banco (full-text/GIN, filtros, JSON, contadores transacionais) não são cobertos.
## O que fazer:
1. Criar uma suíte de **integração** que roda contra um Postgres real, **gated por env** (`TEST_DATABASE_URL`): se a variável não estiver definida, os testes são **pulados** (`describe.skipIf`) — o CI (sem DB) continua verde.
   - Helper de conexão: reusar o padrão de `packages/database/src/client.ts` (Prisma 7 + `@prisma/adapter-pg`) apontando para `TEST_DATABASE_URL`.
   - Preparar/limpar dados de teste (schema já migrado; truncar as tabelas usadas entre testes).
2. **Cards** (`packages/modules/cards/src/test/`): cobrir via `PrismaCardRepository`/`PrismaCardSetRepository`:
   - **full-text** (`to_tsvector('simple', name || ' ' || effects)` + índice GIN `cards_search_idx`): busca por nome e por efeito.
   - filtros combinados (type, color, setCode) e **faixa de custo** (`minPlayCost`/`maxPlayCost`, task 82), incluindo exclusão de `playCost` null.
   - `import` (upsert por `dcgId`) + `card_sets` upsert.
3. **Decks** (`packages/modules/decks/src/test/`): cobrir via `PrismaDeckRepository`/`PrismaPublicDeckRepository`:
   - CRUD de deck + `eggList`/`coverCardId` (JSON/null).
   - **Comunidade**: snapshot (`PublicDeck`), like/unlike (contadores), `recordCopy` (1 por conta), report + `moderate` (hide fecha reports) — os caminhos com **SQL/transação** que o repo em memória não exercita.
4. Nomear os arquivos `*.integration.spec.ts`; documentar no topo como rodar (`TEST_DATABASE_URL=... pnpm turbo test --filter=@digimon/cards`).
5. **Executar** a suíte contra um Postgres local de teste (ex.: criar `digimon_test` no Postgres local já disponível, aplicar `prisma migrate deploy` nele) e reportar o resultado. Se não for possível, **reportar o bloqueio** e deixar a suíte pronta/gated.
## Especificação:
- Não alterar código de produção (só `src/test/**`) nem `package.json`/configs (rode via vitest com env).
- Não usar o DB de dev (`digimon`) para não sujar dados — usar `TEST_DATABASE_URL` separado.
## Critério de conclusão:
- [ ] Suíte gated por `TEST_DATABASE_URL` (pulada sem a env; verde no CI)
- [ ] Cobre full-text/filtros/faixa (cards) e CRUD/egg/capa + comunidade transacional (decks)
- [ ] Execução contra Postgres real reportada (ou bloqueio reportado)
- [ ] `pnpm turbo typecheck lint test --filter=@digimon/cards --filter=@digimon/decks` passando
## Ao terminar: atualizar `context/modules/cards/status.md` e `context/modules/decks/status.md`, rodar `pnpm harness finish 97` e registrar o handoff
## Complexidade: alta

## Baseline (git)
- apps/web/src/app/(member)/torneios/novo/page.tsx
- apps/web/src/features/decks/viewmodels/use-deck-image-export.ts
- context/modules/decks/status.md
- context/modules/web/status.md
- apps/web/src/app/not-found.tsx
- context/agents/done/94-web-torneios-novo-layout.md
- context/agents/done/95-web-not-found-brandado.md
- context/agents/done/96-web-download-png-anchor.md
- context/agents/queue/97-backend-testes-integracao-postgres.md
- context/agents/queue/98-backend-import-assincrono.md
