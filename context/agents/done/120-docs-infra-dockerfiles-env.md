# Task: docs/infra — completar envs do Dockerfile da API + limpar Dockerfile do web + status
## Agente: `agente-backend`
## Módulo: `apps/api`
## Escopo (arquivos que esta task vai tocar):
- `apps/api/Dockerfile`
- `apps/web/Dockerfile`
- `context/modules/api/status.md`
## Depende de: [ ] `118-infra-api-dockerfile-porta-3022.md`, `116-web-remover-dep-users.md`
## Contexto para ler: context/project/deploy.md, context/modules/api/status.md
## Skills a carregar: codegen.md + infra.md
## Pendências (revisão das tasks 116–119):
1. **`apps/api/Dockerfile`**: o cabeçalho lista as envs mas **não** cita `ADMIN_EMAIL`/`ADMIN_PASSWORD` (lidas pelo seed). Adicionar ao comentário de envs, alertando que sem elas o seed usa defaults inseguros.
2. **`apps/web/Dockerfile`**: ainda copia `packages/modules/users/package.json` no estágio `deps` e cita `@digimon/users` no comentário, embora o web **não** dependa mais dele (task 116). Remover o `COPY` ocioso e corrigir o comentário. **Conferir o grafo** do `apps/web` (deps de workspace reais) para não remover algo necessário.
3. **`context/modules/api/status.md`**: registrar a mudança da **porta default 3022** + os **manifests de ads/privacy** no estágio `deps` (a task 118 não conseguiu atualizar por escopo). Adicionar um bloco de handoff/fase.
## Especificação:
- Só comentários/COPY do Dockerfile + doc; **não** alterar estágios além de remover o COPY ocioso, nem o entrypoint/CMD.
- Se o `apps/web/Dockerfile` copiar manifests para bater com o lockfile sem filtro (como o da API), confirmar antes de remover; se o comentário explicar que é intencional, manter o COPY e só corrigir o comentário.
## Critério de conclusão:
- [ ] `apps/api/Dockerfile` cita `ADMIN_EMAIL`/`ADMIN_PASSWORD` com o aviso de defaults inseguros
- [ ] `apps/web/Dockerfile` sem referência ociosa a `@digimon/users` (ou justificada)
- [ ] `context/modules/api/status.md` com a porta 3022 + manifests documentados
## Ao terminar: rodar `pnpm harness finish 120` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/queue/120-docs-infra-dockerfiles-env.md
