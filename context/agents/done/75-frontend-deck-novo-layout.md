# Task: fix frontend — página /decks/novo com largura adequada ao deck builder
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/app/(member)/decks/novo/page.tsx`
- `apps/web/src/features/decks/views/deck-form-view.tsx`
## Depende de: [ ] `72-frontend-fix-form-deck.md`
## Contexto para ler: context/modules/decks/context.md, context/modules/web/context.md, context/project/design
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Problema:
O formulário de criar deck foi redesenhado em 2 colunas (task 72), mas a página `/decks/novo` ainda usa o `AuthShell` (card de **420px**), o que **aperta/estraga** o layout novo. Um deck builder precisa de largura de tela.
## O que fazer:
1. **`decks/novo/page.tsx`**: abandonar o `AuthShell` estreito para esta página. Usar um **container largo** (mesmo padrão das outras páginas públicas/dashboard: `mx-auto w-full max-w-[1440px] px-4 py-10 lg:px-12`), com um cabeçalho (título "Criar deck" + subtítulo) usando os componentes de tipografia do design system. **Manter a proteção de rota** (a rota está sob `(member)` — não remover o gate; se o gate for do layout do grupo, não precisa fazer nada).
2. **`deck-form-view.tsx`**: ajustar para ocupar bem o container largo (garantir que as 2 colunas respirem; `lg:sticky` no painel do deck já existe). Não quebrar o MVVM.
3. Não alterar `AuthShell`/`features/auth` (usado por login/registro).
## Critério de conclusão:
- [ ] `/decks/novo` usa layout largo (não o card de 420px), com as 2 colunas legíveis
- [ ] Rota continua exigindo Member (gate preservado)
- [ ] `pnpm turbo typecheck lint build --filter=@digimon/app-web` passando
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 75` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- apps/web/next-env.d.ts
- apps/web/public/dcg-logo.png
- apps/web/src/components/card-tile.tsx
- apps/web/src/components/site-footer.tsx
- apps/web/src/components/site-header.tsx
- apps/web/src/features/cards/views/card-detail-view.tsx
- apps/web/src/features/content/viewmodels/use-home.ts
- apps/web/src/features/content/views/home-view.tsx
- apps/web/src/features/decks/viewmodels/use-deck-form.ts
- apps/web/src/features/decks/views/deck-form-view.tsx
- context/modules/content/status.md
- context/modules/decks/status.md
- context/modules/web/status.md
- context/agents/done/71-frontend-fix-ficha-arte-inteira.md
- context/agents/done/72-frontend-fix-form-deck.md
- context/agents/done/73-frontend-home-remover-torneios.md
- context/agents/done/74-assets-logo-transparente.md
- context/agents/queue/75-frontend-deck-novo-layout.md
