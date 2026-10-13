# Task: web — configurações (admin) com padding igual às demais telas
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/admin/views/site-settings-view.tsx`
## Depende de: [ ] —
## Contexto para ler: context/project/stack.md, context/modules/web/context.md
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pedido do usuário:
"Na tela de configurações, em admin o padding não está igual às demais telas de admin."
## Diagnóstico:
- `apps/web/src/app/admin/layout.tsx` renderiza `<main className="flex-1">` (sem padding próprio).
- Todas as views do painel aplicam padding no wrapper raiz com `className="flex flex-col gap-6 p-4 lg:p-8"`
  (users, tournaments, cards, ads, decks, deck-moderation, comments, data-requests, posts, dashboard).
- `site-settings-view.tsx` usa apenas `className="flex flex-col gap-6"` — falta `p-4 lg:p-8`.
## Especificação:
- Adicionar `p-4 lg:p-8` ao wrapper raiz de `SiteSettingsView`, resultando em
  `className="flex flex-col gap-6 p-4 lg:p-8"` (idêntico às demais telas).
- Não alterar `gap-6`, o `max-w-2xl` do `<article>`, nem qualquer outro estilo/lógica.
- Sem mudança de comportamento — apenas layout/responsividade do contêiner.
## Critério de conclusão:
- [ ] Wrapper raiz de `site-settings-view.tsx` com `p-4 lg:p-8`
- [ ] `pnpm turbo typecheck --filter=@digimon/app-web` passando
- [ ] `git diff` restrito ao `## Escopo`
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 123` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/queue/123-web-admin-configuracoes-padding.md
