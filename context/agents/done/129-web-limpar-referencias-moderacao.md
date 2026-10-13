# Task: web — limpar referências stale a moderação (após tasks 124/126)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/app/admin/page.tsx`
- `apps/web/src/features/admin/views/admin-dashboard-view.tsx`
- `apps/web/src/features/decks/model/community-types.ts`
## Depende de: [ ] —
## Contexto para ler: context/modules/web/context.md, context/modules/decks/context.md
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pedido do usuário:
Corrigir os comentários/rótulos que ficaram desatualizados após remover a moderação hardcoded de comentários (task 124) e a moderação de decks (tasks 126/127).
## Especificação (apenas texto/comentários — zero mudança de comportamento):
1. `app/admin/page.tsx` (linha 2): comentário passa a descrever o painel sem "moderação"
   (ex.: "Painel administrativo — visão geral (métricas + posts).").
2. `views/admin-dashboard-view.tsx` (linha ~57): subtítulo do `AdminPageHeader` sem "e a moderação"
   (ex.: "Acompanhe o workflow editorial.").
3. `model/community-types.ts` (linha 7): comentário do `CommunityDeckStatus` sem a menção a moderação
   (o estado `hidden` permanece no tipo; ajustar apenas o texto descritivo).
## NÃO alterar:
- `model/admin-api.ts`, `model/types.ts`, `viewmodels/use-admin-comments-view-model.ts` — a moderação **de comentários** continua existindo e essas descrições seguem válidas.
- Nenhuma lógica, tipo ou comportamento.
## Critério de conclusão:
- [ ] As 3 referências stale corrigidas; nenhuma outra "moderação" indevida em `apps/web/src` (fora das de comentários)
- [ ] `pnpm turbo typecheck --filter=@digimon/app-web` passando
- [ ] `git diff` restrito ao `## Escopo`
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 129` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/queue/129-web-limpar-referencias-moderacao.md
