# Task: web — editor de Post: botões de parágrafo, link, imagem e blockquote
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/components/editor/editor-toolbar.tsx`
- `apps/web/src/components/editor/post-editor.tsx`
- `apps/web/package.json` (nova dependência, aprovada pelo usuário)
- `pnpm-lock.yaml` (aprovado pelo usuário)
## Depende de: [ ] —
## Contexto para ler: context/modules/web/context.md, context/modules/content/context.md
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pedido do usuário:
"No Formulário de Post, adicionar botão para link, imagem, blockquote e parágrafo."
## Diagnóstico:
- `editor-toolbar.tsx` já tem: H1, H2, Negrito, Itálico, Riscado, Lista, Lista numerada, Citação (blockquote), Código.
- **Blockquote já existe** ("Citação"), `editor.isActive('blockquote')` + `toggleBlockquote()` — apenas manter.
- Falta **Parágrafo** (`setParagraph()`), **Link** (extensão `@tiptap/extension-link` JÁ instalada e registrada em `post-editor.tsx`) e **Imagem** (extensão `@tiptap/extension-image` NÃO instalada).
- Não há endpoint de upload; imagens do projeto são por URL (ex.: capa). Então o botão de imagem insere `<img src>` a partir de uma URL.
## Especificação:
1. Instalar `@tiptap/extension-image` na mesma linha de versão das demais (`^3.31.4`) em `apps/web` e registrar a extensão em `post-editor.tsx` (configurar com `inline: false`, permitindo atributo `src`).
2. Adicionar ao toolbar (ícones do `lucide-react`), no mesmo padrão de `ToolbarButton`:
   - **Parágrafo** → `editor.chain().focus().setParagraph().run()` (ícone `Pilcrow`).
   - **Link** → prompt da URL (`window.prompt`), usando `extendMarkRange('link').setLink({ href })` quando houver texto selecionado; se a seleção já for um link, o mesmo botão oferece remover (`unsetLink`). Estado ativo via `editor.isActive('link')` (ícone `Link`).
   - **Imagem** → prompt da URL e `editor.chain().focus().setImage({ src }).run()` (ícone `Image`).
   - **Blockquote** permanece como está ("Citação").
3. Manter `onMouseDown` com `preventDefault` (não roubar o foco) e acessibilidade (`aria-label`/`title`) dos botões.
4. Não alterar o menu de slash commands, o MVVM do formulário nem os demais atalhos; apenas os botões.
## Critério de conclusão:
- [ ] Botões de Parágrafo, Link, Imagem e Blockquote presentes e funcionais no editor
- [ ] `@tiptap/extension-image` instalada e registrada; sem erro de schema ao inserir imagem/link
- [ ] `pnpm turbo typecheck --filter=@digimon/app-web` passando
- [ ] `git diff` restrito ao `## Escopo`
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 128` e registrar o handoff
## Complexidade: baixa/média

## Baseline (git)
- apps/api/src/container.ts
- apps/api/src/routes/community-decks.ts
- apps/api/src/routes/community-rate-limit.ts
- apps/web/src/app/admin/decks/moderacao/page.tsx
- apps/web/src/features/admin/index.ts
- apps/web/src/features/admin/model/deck-moderation-api.ts
- apps/web/src/features/admin/model/demo-data.ts
- apps/web/src/features/admin/model/types.ts
- apps/web/src/features/admin/viewmodels/use-admin-deck-moderation.ts
- apps/web/src/features/admin/viewmodels/use-admin-moderation-view-model.ts
- apps/web/src/features/admin/views/admin-ads-view.tsx
- apps/web/src/features/admin/views/admin-comments-view.tsx
- apps/web/src/features/admin/views/admin-dashboard-view.tsx
- apps/web/src/features/admin/views/admin-deck-moderation-view.tsx
- apps/web/src/features/admin/views/admin-shell.tsx
- apps/web/src/features/admin/views/moderation-queue.tsx
- apps/web/src/features/admin/views/site-settings-view.tsx
- apps/web/src/features/decks/model/community-api.ts
- apps/web/src/features/decks/model/community-types.ts
- context/modules/decks/status.md
- context/modules/web/status.md
- packages/database/prisma/schema.prisma
- packages/database/src/generated/prisma/browser.ts
- packages/database/src/generated/prisma/client.ts
- packages/database/src/generated/prisma/internal/class.ts
- packages/database/src/generated/prisma/internal/prismaNamespace.ts
- packages/database/src/generated/prisma/internal/prismaNamespaceBrowser.ts
- packages/database/src/generated/prisma/models.ts
- packages/database/src/generated/prisma/models/CommunityDeckReport.ts
- packages/database/src/generated/prisma/models/PublicDeck.ts
- packages/database/src/generated/prisma/models/User.ts
- packages/database/src/index.ts
- packages/modules/decks/src/domain/community/community-types.ts
- packages/modules/decks/src/domain/events/deck-events.ts
- packages/modules/decks/src/domain/repositories/public-deck-repository.ts
- packages/modules/decks/src/index.ts
- packages/modules/decks/src/infra/repositories/prisma-public-deck-repository.ts
- packages/modules/decks/src/test/decks.integration.spec.ts
- packages/modules/decks/src/use-cases/community/community.spec.ts
- packages/modules/decks/src/use-cases/community/dismiss-deck-reports.ts
- packages/modules/decks/src/use-cases/community/get-community-deck.ts
- packages/modules/decks/src/use-cases/community/list-reported-decks.ts
- packages/modules/decks/src/use-cases/community/moderate-community-deck.ts
- packages/modules/decks/src/use-cases/community/open-deck-reports.ts
- packages/modules/decks/src/use-cases/community/report-community-deck.ts
- packages/modules/decks/src/use-cases/community/schemas.ts
- context/agents/done/123-web-admin-configuracoes-padding.md
- context/agents/done/124-web-admin-remover-moderacao-comentarios-demo.md
- context/agents/done/125-web-admin-anuncios-filtros-select.md
- context/agents/done/126-backend-remover-moderacao-decks.md
- context/agents/done/127-web-remover-moderacao-decks.md
- context/agents/queue/128-web-editor-toolbar-botoes.md
- packages/database/prisma/migrations/20261013120000_remove_deck_moderation/migration.sql
