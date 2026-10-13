# Task: web — remover moderação de comentários (dados demo/hardcoded) do admin
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/admin/views/admin-dashboard-view.tsx`
- `apps/web/src/features/admin/views/admin-comments-view.tsx`
- `apps/web/src/features/admin/views/moderation-queue.tsx` (remover)
- `apps/web/src/features/admin/viewmodels/use-admin-moderation-view-model.ts` (remover)
- `apps/web/src/features/admin/model/demo-data.ts` (remover)
- `apps/web/src/features/admin/model/types.ts`
- `apps/web/src/features/admin/index.ts`
## Depende de: [ ] —
## Contexto para ler: context/modules/web/context.md, context/modules/comments/context.md
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pedido do usuário:
"A postagem dos comentários: na home e comentários a parte de 'moderação de comentários' está hardcoded? caso sim, deixe só o que vem do banco." → removido.
## Diagnóstico:
- `use-admin-moderation-view-model.ts` parte de `DEMO_MODERATION` (hardcoded em `model/demo-data.ts`).
- O bloco é renderizado por `<ModerationQueue>` em `admin-dashboard-view.tsx` (home) e `admin-comments-view.tsx`.
- O banco NÃO tem sinalização/flag de comentário (`CommentStatus` = VISIBLE/HIDDEN/DELETED) → não existe fonte real para a fila.
- Métricas e tabela dessas telas já vêm do banco (`GET /comments/admin`) — devem permanecer intactas.
- `DEMO_COMMENTS` também é código morto (não usado em nenhum lugar).
## Especificação:
- Remover o bloco `<ModerationQueue ... />` e os imports/VM de moderação das DUAS views (dashboard e comentários), mantendo métricas + tabela (dados reais).
- Remover arquivos que ficam mortos: `views/moderation-queue.tsx`, `viewmodels/use-admin-moderation-view-model.ts`, `model/demo-data.ts`.
- Remover o tipo `ModerationItem` de `model/types.ts`.
- Remover os exports `ModerationQueue` / `ModerationQueueProps` do barrel `index.ts`.
- Nenhuma outra mudança de comportamento/estilo.
## Critério de conclusão:
- [ ] Home (`/admin`) e Comentários (`/admin/comentarios`) sem o bloco de moderação hardcoded
- [ ] Métricas e tabela seguem alimentadas pela API (`GET /comments/admin`)
- [ ] Nenhuma referência a `DEMO_MODERATION`, `DEMO_COMMENTS`, `ModerationItem` ou `ModerationQueue` restante
- [ ] `pnpm turbo typecheck --filter=@digimon/app-web` passando
- [ ] `pnpm harness check --barrel` limpo
- [ ] `git diff` restrito ao `## Escopo`
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 124` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- apps/web/src/features/admin/views/site-settings-view.tsx
- context/modules/web/status.md
- context/agents/done/123-web-admin-configuracoes-padding.md
- context/agents/queue/124-web-admin-remover-moderacao-comentarios-demo.md
- context/agents/queue/125-web-admin-anuncios-filtros-select.md
