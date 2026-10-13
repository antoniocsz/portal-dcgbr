# Task: tooling — limitar concorrência do turbo (estabilidade do typecheck no Windows)
## Agente: `agente-coordinator` (config de build/tooling — sem módulo de domínio)
## Módulo: raiz/monorepo (config de build — `turbo.json`)
## Escopo (arquivos que esta task vai tocar):
- `turbo.json`
## Depende de: [ ] —
## Contexto para ler: context/project/stack.md
## Skills a carregar: codegen.md + infra.md
## Ponto de atenção (reportado no lote de cards/torneios):
`pnpm turbo typecheck` abortou intermitentemente com **exit 134** (abort do V8) em `@digimon/decks`/`@digimon/auth`. Não é determinístico: rodando `pnpm turbo typecheck --force` com a config atual passou 14/14.
## Diagnóstico:
- `turbo.json` usa o **default `concurrency: "10"`** (turbo 2.11.5, confirmado em `docs/reference/configuration.mdx` do pacote instalado).
- A máquina de dev tem **8 CPUs / 20 GB**: 10 `tsc` em paralelo estoura memória.
- Turbo 2.11.5 suporta `"concurrency"` global no `turbo.json` (string; inteiro ≥ 1 ou percentual). Não existe `concurrency` por task.
## Decisão do usuário:
Aplicar o valor recomendado **`"4"`** (absoluto, previsível em qualquer máquina; ≤ núcleos da máquina de dev).
## Especificação:
- Adicionar `"concurrency": "4"` no nível raiz de `turbo.json`, sem alterar `tasks`/cache.
## Critério de conclusão:
- [ ] `turbo.json` com `"concurrency": "4"` (JSON válido, sem quebrar o schema)
- [ ] `pnpm turbo typecheck` passa 14/14 (com a nova config)
- [ ] `git diff` restrito ao `## Escopo`
## Ao terminar: rodar `pnpm harness finish 140` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/queue/140-tooling-turbo-concurrency.md
