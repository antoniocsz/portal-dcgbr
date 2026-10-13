# Task: fix web — tipos locais em features/users (remover import type de @digimon/users)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/users/model/types.ts`
## Depende de: [ ] `110-lgpd-direitos-titular.md`
## Contexto para ler: context/modules/users/context.md, context/modules/web/context.md
## Skills a carregar: codegen.md + frontend.md
## Pendência (revisão do Lote 16):
`features/users/model/types.ts` importa `UserDataExport`/`UserView` de `@digimon/users` como `import type` (apagado no build, mas referência ao pacote). O padrão do projeto é **tipos literais espelhados** no client (sem importar o módulo).
## O que fazer:
1. Substituir o `import type { UserDataExport, UserView } from '@digimon/users'` por **tipos-espelho locais** com o mesmo formato (copiar a forma do DTO usado — perfil + dados do export). Manter os nomes exportados (`UserDataExport`, `UserView`) para não quebrar `users-api.ts`/viewmodels.
2. Nenhuma mudança de runtime; só tipos.
## Critério de conclusão:
- [ ] `features/users` **não** referencia mais `@digimon/users`
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 111` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/queue/111-web-users-tipos-locais.md
- context/agents/queue/112-web-consent-banner-fora-admin.md
- context/agents/queue/113-api-revogacao-access-token.md
- context/agents/queue/114-backend-module-privacy.md
- context/agents/queue/115-web-privacy-consent-requests.md
- context/modules/privacy/context.md
- context/modules/privacy/status.md
