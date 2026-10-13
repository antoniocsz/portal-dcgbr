# Task: chore docs — alinhar doc da privacy, newline do schema e nota do policyVersion
## Agente: `agente-backend`
## Módulo: `packages/modules/privacy`
## Escopo (arquivos que esta task vai tocar):
- `context/modules/privacy/context.md`
- `packages/database/prisma/schema.prisma`
- `packages/modules/privacy/src/domain/entities/consent-record.ts`
- `apps/web/src/features/consent/model/consent.ts`
## Depende de: [ ] `114-backend-module-privacy.md`, `115-web-privacy-consent-requests.md`
## Contexto para ler: context/modules/privacy/context.md
## Skills a carregar: codegen.md + data.md
## Pendências (revisão do Lote 17):
1. `context/modules/privacy/context.md` descreve `GET /admin/consent` como `{ items, total }`, mas a rota devolve paginado `{ items, total, page, pageSize }` — alinhar a doc.
2. `packages/database/prisma/schema.prisma` está **sem newline final** — adicionar.
3. `DEFAULT_POLICY_VERSION` (back) e `CONSENT_POLICY_VERSION` (front) precisam ser **bumpados em conjunto** quando o texto legal mudar — adicionar **comentário** em cada um referenciando o outro.
## O que fazer:
1. Corrigir a doc do `GET /admin/consent` (paginado) no `context.md`.
2. Garantir newline final no `schema.prisma` (sem alterar o schema em si).
3. Comentários cruzados: em `consent-record.ts` (`DEFAULT_POLICY_VERSION`) e em `features/consent/model/consent.ts` (`CONSENT_POLICY_VERSION`), anotar "**bump junto com o outro** quando a política mudar".
## Especificação:
- Só documentação/comentário + newline; **nenhuma** mudança de comportamento ou schema.
## Critério de conclusão:
- [ ] Doc do `GET /admin/consent` correta; newline final no schema; comentários cruzados nos dois `POLICY_VERSION`
- [ ] `pnpm turbo typecheck lint --filter=@digimon/privacy --filter=@digimon/app-web` passando
## Ao terminar: atualizar `context/modules/privacy/status.md`, rodar `pnpm harness finish 117` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- apps/web/next.config.ts
- apps/web/package.json
- context/modules/web/status.md
- pnpm-lock.yaml
- context/agents/done/116-web-remover-dep-users.md
- context/agents/queue/117-chore-docs-privacy.md
- context/agents/queue/118-infra-api-dockerfile-porta-3022.md
