# Task: web — remover moderação de decks (admin + API client da comunidade)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/app/admin/decks/moderacao/page.tsx` (remover)
- `apps/web/src/features/admin/views/admin-deck-moderation-view.tsx` (remover)
- `apps/web/src/features/admin/viewmodels/use-admin-deck-moderation.ts` (remover)
- `apps/web/src/features/admin/model/deck-moderation-api.ts` (remover)
- `apps/web/src/features/admin/views/admin-shell.tsx`
- `apps/web/src/features/admin/index.ts`
- `apps/web/src/features/decks/model/community-api.ts`
- `apps/web/src/features/decks/model/community-types.ts`
## Depende de: [ ] —
## Contexto para ler: context/modules/web/context.md, context/modules/decks/context.md
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pedido do usuário:
"A postagem dos decks também não deve ter moderação." (backend removido na task 126)
## Diagnóstico:
- UI admin da moderação: item de menu "Moderação de decks" em `admin-shell.tsx`, rota `/admin/decks/moderacao`, `admin-deck-moderation-view.tsx`, `use-admin-deck-moderation.ts`, `deck-moderation-api.ts` (+ exports no barrel).
- No client da comunidade, `communityDecksApi.report()` e os tipos `ReportCommunityDeckInput`/`CommunityReportReason` são código morto (nenhuma UI chama).
## Especificação:
1. Remover o item de menu "Moderação de decks" de `admin-shell.tsx` (e o import do ícone `ShieldAlert` se ficar órfão).
2. Deletar a rota `/admin/decks/moderacao/page.tsx` e os 3 arquivos da feature admin (view, viewmodel, api).
3. Remover do barrel `index.ts` os exports `deckModerationApi`, os tipos de moderação de decks, `AdminDeckModerationView` e `useAdminDeckModeration`.
4. Remover `communityDecksApi.report()` de `community-api.ts` e os tipos `ReportCommunityDeckInput`/`CommunityReportReason` de `community-types.ts` (+ imports órfãos).
5. Não alterar as demais rotas de comunidade (feed/like/copy/publicações) nem a tela `/admin/decks`.
## Critério de conclusão:
- [ ] Sem item de menu e sem rota de moderação de decks no admin
- [ ] Nenhuma referência a `deckModerationApi`, `useAdminDeckModeration`, `AdminDeckModerationView`, `DeckModeration` ou `report(` restante em `apps/web/src`
- [ ] `pnpm turbo typecheck --filter=@digimon/app-web` passando
- [ ] `pnpm harness check --barrel` limpo
- [ ] `git diff` restrito ao `## Escopo`
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 127` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- apps/web/src/features/admin/index.ts
- apps/web/src/features/admin/model/demo-data.ts
- apps/web/src/features/admin/model/types.ts
- apps/web/src/features/admin/viewmodels/use-admin-moderation-view-model.ts
- apps/web/src/features/admin/views/admin-ads-view.tsx
- apps/web/src/features/admin/views/admin-comments-view.tsx
- apps/web/src/features/admin/views/admin-dashboard-view.tsx
- apps/web/src/features/admin/views/moderation-queue.tsx
- apps/web/src/features/admin/views/site-settings-view.tsx
- context/modules/web/status.md
- context/agents/active/126-backend-remover-moderacao-decks.md
- context/agents/done/123-web-admin-configuracoes-padding.md
- context/agents/done/124-web-admin-remover-moderacao-comentarios-demo.md
- context/agents/done/125-web-admin-anuncios-filtros-select.md
- context/agents/queue/127-web-remover-moderacao-decks.md
