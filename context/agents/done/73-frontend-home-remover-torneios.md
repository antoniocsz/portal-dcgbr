# Task: fix frontend — remover torneios hardcoded da home
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/content/views/home-view.tsx`
- `apps/web/src/features/content/viewmodels/use-home.ts`
## Depende de: [ ] —
## Contexto para ler: context/modules/content/context.md
## Skills a carregar: codegen.md + frontend.md
## Problema reportado:
A home mostra uma seção **"Próximos torneios no Brasil"** com 3 torneios **hardcoded** (`UPCOMING_TOURNAMENTS` em `use-home.ts`). Deve ser **removida**.
## O que alterar:
1. **`use-home.ts`**: remover `UPCOMING_TOURNAMENTS`, o import de `TournamentCardData` e o campo `tournaments` de `HomeData`/retorno. Atualizar o comentário do topo do arquivo (não mencionar mais torneios estáticos).
2. **`home-view.tsx`**: remover a `<section>` "Próximos torneios no Brasil", o import de `TournamentCard` e o destructuring de `tournaments`.
3. Não introduzir dados falsos de torneios. (Se quiser, apenas manter as outras seções — herói, categorias, últimas notícias, CTA.)
## Critério de conclusão:
- [ ] Nenhuma menção a torneios hardcoded na home
- [ ] `TournamentCard` não é mais importado na home
- [ ] Nenhum import/uso órfão (typecheck/lint limpos)
- [ ] `pnpm turbo typecheck lint build --filter=@digimon/app-web` passando
## Ao terminar: atualizar `context/modules/web/status.md` e `context/modules/content/status.md`, rodar `pnpm harness finish 73` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- apps/web/next-env.d.ts
- apps/web/public/dcg-logo.png
- apps/web/src/components/card-tile.tsx
- apps/web/src/components/site-footer.tsx
- apps/web/src/components/site-header.tsx
- apps/web/src/features/cards/views/card-detail-view.tsx
- apps/web/src/features/decks/viewmodels/use-deck-form.ts
- apps/web/src/features/decks/views/deck-form-view.tsx
- context/modules/decks/status.md
- context/modules/web/status.md
- context/agents/done/71-frontend-fix-ficha-arte-inteira.md
- context/agents/done/72-frontend-fix-form-deck.md
- context/agents/queue/73-frontend-home-remover-torneios.md
- context/agents/queue/74-assets-logo-transparente.md
