# Task: backend — paridade da busca por código no MemoryCardRepository + comentário da interface
## Agente: `agente-backend`
## Módulo: `packages/modules/cards`
## Escopo (arquivos que esta task vai tocar):
- `packages/modules/cards/src/test/memory-card-repository.ts`
- `packages/modules/cards/src/domain/repositories/card-repository.ts`
- `packages/modules/cards/src/use-cases/cards.spec.ts`
## Depende de: [ ] —
## Contexto para ler: context/modules/cards/context.md, context/modules/cards/status.md
## Skills a carregar: codegen.md + backend.md + testing.md
## Origem (ponto de atenção reportado na task 137):
- `MemoryCardRepository.search` (test double) só casa nome/efeitos (`haystack = name + effects`), mas o `PrismaCardRepository` passou a casar também `number` (código da carta, ex. `BT1-001`) e `setCode` (coleção, ex. `BT1`) com normalização (minúsculas, sem hífen/espaço) e priorização de match de código. **Paridade quebrada** entre test double e produção.
- O comentário do campo `search` em `card-repository.ts` ("Termo de busca full-text (nome/efeito)") ficou desatualizado.
## Especificação:
1. `memory-card-repository.ts`: refletir a mesma semântica de busca do Prisma — casar nome/efeitos (substring, case-insensitive) **e** `number`/`setCode` com normalização (remover hífen/espaço, minúsculas; ex.: `BT1-001` ≡ `BT1 001` ≡ `bt1001`); manter a **ordem** de prioridade equivalente (match de código antes do textual) para o double não divergir do comportamento real.
2. `card-repository.ts`: atualizar o comentário de `search` para "Termo de busca: nome/efeito (full-text) ou código da carta/coleção (`number`/`setCode`)".
3. `cards.spec.ts`: adicionar caso(s) unitário(s) cobrindo busca por `number` e por `setCode` via o double.
## Critério de conclusão:
- [ ] Double e Prisma com a mesma semântica (nome/efeito + número/coleção normalizados)
- [ ] Comentário da interface atualizado
- [ ] Testes do módulo cards passando
- [ ] `pnpm turbo typecheck --filter=@digimon/cards` passando
- [ ] `git diff` restrito ao `## Escopo`
## Ao terminar: atualizar `context/modules/cards/status.md`, rodar `pnpm harness finish 139` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/queue/139-backend-cards-paridade-memory-repo.md
