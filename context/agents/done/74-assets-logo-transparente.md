# Task: fix assets/web — logo com fundo transparente + corrigir tamanho no rodapé
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/public/dcg-logo.png`
- `apps/web/src/components/site-header.tsx`
- `apps/web/src/components/site-footer.tsx`
## Depende de: [ ] —
## Contexto para ler: context/modules/web/context.md, context/project/design
## Skills a carregar: codegen.md + frontend.md
## Situação (já verificada):
- A logo **commitada** (`HEAD:apps/web/public/dcg-logo.png`, 1280×364) tem **fundo opaco** (só 23% transparente) — é o que aparece com fundo.
- O working tree já tem uma versão **transparente** (`937×266`, 52,8% transparente, cantos RGBA `(0,0,0,0)`) — provavelmente uma tentativa anterior não commitada.
- **Regressão no rodapé:** `site-footer.tsx` removeu `className="h-[38px] w-auto"` do `<Image>` → a logo do rodapé renderiza no tamanho natural (enorme).
## O que fazer:
1. **Logo transparente:** garantir que `apps/web/public/dcg-logo.png` tenha **fundo transparente** e boa qualidade. Você pode:
   - usar a versão transparente do working tree, ou
   - re-derivar de `context/project/design/dcg-logo.png` removendo o fundo (ex.: tornar transparente o fundo branco/uniforme via Python PIL — disponível) e aparar o padding (`crop` pela bbox do alpha), exportando RGBA.
   Verifique ao final: cantos com alpha=0 e nenhum retângulo de fundo opaco. Evite halos brancos nas bordas (se houver, limpe o alpha).
2. **`site-header.tsx`**: manter a logo no header com altura controlada (ex.: `h-9 w-auto`) e o texto/decoração coerentes (a arte já contém "BRASIL"; não duplicar o texto "Brasil").
3. **`site-footer.tsx`**: **restaurar a altura controlada** da logo (ex.: `h-[38px] w-auto`) para não estourar o layout; manter `loading="eager"` só se fizer sentido.
4. `apps/web/next-env.d.ts` foi regenerado pelo build — deixe como está (artefato; não faz parte desta task).
## Critério de conclusão:
- [ ] `dcg-logo.png` com fundo transparente (cantos alpha=0, sem retângulo opaco)
- [ ] Header e rodapé renderizam a logo com tamanho correto (sem estourar/colapsar)
- [ ] `pnpm turbo typecheck lint build --filter=@digimon/app-web` passando
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 74` e registrar o handoff
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
- context/agents/queue/74-assets-logo-transparente.md
