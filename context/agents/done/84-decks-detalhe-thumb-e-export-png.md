# Task: decks — detalhe do deck: CardThumb via next/image + Exportar deck em PNG
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/decks/views/deck-detail-view.tsx`
- `apps/web/src/features/decks/views/deck-image-export-button.tsx` (novo)
- `apps/web/src/features/decks/views/deck-export-modal.tsx`
- `apps/web/src/features/decks/viewmodels/use-deck-image-export.ts` (novo)
- `apps/web/src/features/decks/views/index.ts`
## Depende de: [ ] `79-frontend-deck-detalhe.md`, `83-web-next-image-setscount.md`
## Contexto para ler: context/modules/decks/context.md, context/modules/web/context.md, context/project/design
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Referência (projeto análogo `aegis-digimon-tcg`): `apps/web/src/screens/deckImageExport.ts`, `DeckImageButton.tsx`, `useDeckImagePreview.ts` (export PNG do deck).
## Itens:
1. **Fix (1):** o `CardThumb` em `deck-detail-view.tsx` ainda usa `<img>` nativo — migrar para **`next/image`** (com `fill`/`sizes` ou `width`/`height`), mantendo o fallback (`onError`/sem `imageUrl`). O `remotePatterns` já foi configurado (task 83).
2. **Feature (3): Exportar o deck como PNG** (não existe — só export texto):
   - **`use-deck-image-export.ts`** (ViewModel): gera um **PNG do deck** em canvas (título, formato, cores, seções com as cartas — arte + nome + quantidade, e a capa). Retorna um data URL / dispara download.
   - ⚠️ **Atenção ao canvas taint:** as artes oficiais são de outra origem (`world.digimoncard.com`). Desenhar imagem cross-origin sem CORS **quebra o `toDataURL`**. Solução recomendada: usar a **imagem otimizada same-origin do Next** (`/_next/image?url=<encodeURIComponent(imageUrl)>&w=…&q=75`) como fonte no canvas — ela é servida pelo nosso domínio e não contamina o canvas. (Alternativa: desenhar sem arte, com placeholders coloridos.) Tratar falha de carregamento de cada imagem sem quebrar o export.
   - **`deck-image-export-button.tsx`** (View, botão) + **aba "Imagem" no `DeckExportModal`** (junto do texto) e/ou botão direto no detalhe. Download via `canvas.toBlob` + `URL.createObjectURL` + `<a download>`.
   - Estados: gerando / pronto / falhou; nomes de arquivo `deck-<slug>.png`.
3. MVVM estrito; nada de canvas/fetch na View pura além dos callbacks do VM. Acessibilidade (botão com label).
## Critério de conclusão:
- [ ] `CardThumb` usa `next/image` (fallback preservado)
- [ ] Export PNG gera e baixa uma imagem do deck (com arte) — ou degrada com segurança se a arte falhar
- [ ] Integração no detalhe/`DeckExportModal` com estados claros
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md` e `context/modules/decks/status.md`, rodar `pnpm harness finish 84` e registrar o handoff
## Complexidade: alta

## Baseline (git)
- context/agents/queue/84-decks-detalhe-thumb-e-export-png.md
- context/agents/queue/85-web-deck-detalhe-ssr-cookie.md
- context/agents/queue/86-web-deck-editar-gate-dono.md
- context/agents/queue/87-cards-filtros-tipagem.md
