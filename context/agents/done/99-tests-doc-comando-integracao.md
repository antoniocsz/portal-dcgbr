# Task: fix tests — documentar o comando correto da suíte de integração (Turbo env strict)
## Agente: `agente-backend`
## Módulo: `packages/modules/cards`
## Escopo (arquivos que esta task vai tocar):
- `packages/modules/cards/src/test/integration-db.ts`
- `packages/modules/decks/src/test/integration-db.ts`
## Depende de: [ ] `97-backend-testes-integracao-postgres.md`
## Contexto para ler: context/modules/cards/status.md, context/modules/decks/status.md
## Skills a carregar: codegen.md + testing.md
## Pendência (apontada na revisão do Lote 13):
O cabeçalho de `integration-db.ts` documenta rodar via `TEST_DATABASE_URL=… pnpm turbo test --filter=@digimon/cards`. No **Turbo 2.11.5** (`envMode: "strict"` por default, e `turbo.json` não declara `TEST_DATABASE_URL`), essa env é **filtrada** → a suíte fica **silenciosamente pulada** mesmo com a variável exportada. O caminho que realmente roda é `pnpm --filter @digimon/cards test` (usado no handoff).
## O que fazer:
1. Corrigir os comentários/documentação nos dois `integration-db.ts` para o **comando correto**:
   - cards: `TEST_DATABASE_URL=postgresql://... pnpm --filter @digimon/cards test`
   - decks: `TEST_DATABASE_URL=postgresql://... pnpm --filter @digimon/decks test`
2. Adicionar uma nota curta: via `pnpm turbo test` a env é filtrada (strict) e a suíte é pulada — use o comando direto do pacote (ou `--env-mode=loose`).
3. Só comentários/documentação — **nenhuma** mudança de lógica de teste (sem tocar `describe.skipIf`, helpers, specs).
## Critério de conclusão:
- [ ] Comentários dos dois helpers com o comando correto + nota do Turbo strict
- [ ] Nenhuma mudança funcional nos testes
- [ ] `pnpm turbo typecheck lint test --filter=@digimon/cards --filter=@digimon/decks` passando (integração pulada sem env)
## Ao terminar: atualizar `context/modules/cards/status.md` e `context/modules/decks/status.md`, rodar `pnpm harness finish 99` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/queue/99-tests-doc-comando-integracao.md
