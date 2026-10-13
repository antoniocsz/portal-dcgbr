# Task: chore web — remover dependência órfã @digimon/users
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/package.json`
- `apps/web/next.config.ts`
- `pnpm-lock.yaml`
## Depende de: [ ] `111-web-users-tipos-locais.md`
## Contexto para ler: context/modules/web/context.md
## Skills a carregar: codegen.md + frontend.md
## Pendência (revisão do Lote 17):
Após a task 111, `apps/web/src` **não importa mais** `@digimon/users`, mas a dependência continua declarada em `apps/web/package.json` e em `next.config.ts` (`transpilePackages`).
## O que fazer:
1. Remover `"@digimon/users": "workspace:*"` de `apps/web/package.json`.
2. Remover `'@digimon/users'` de `transpilePackages` em `apps/web/next.config.ts`.
3. Rodar `pnpm install` para reconciliar o `pnpm-lock.yaml`.
4. Confirmar que nada em `apps/web/src` importa `@digimon/users` (grep).
## Especificação:
- **Guard rail #4**: alterar `package.json`/rodar `pnpm install` é mudança estrutural — **aprovada pelo usuário** (esta task é a limpeza pedida). Sem dependência externa nova.
## Critério de conclusão:
- [ ] `@digimon/users` removido de `apps/web/package.json` e `next.config.ts`; lockfile reconciliado
- [ ] `pnpm turbo typecheck lint build --filter=@digimon/app-web` passando
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 116` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/queue/116-web-remover-dep-users.md
- context/agents/queue/117-chore-docs-privacy.md
- context/agents/queue/118-infra-api-dockerfile-porta-3022.md
