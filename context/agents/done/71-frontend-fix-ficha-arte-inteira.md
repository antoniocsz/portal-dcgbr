# Task: fix frontend — ficha da carta deve mostrar a arte inteira (sem corte)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/cards/views/card-detail-view.tsx`
- `apps/web/src/components/card-tile.tsx`
## Depende de: [ ] —
## Contexto para ler: context/modules/cards/context.md, context/project/design
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Problema reportado:
Na **ficha da carta** (`/cartas/[id]`), a imagem não aparece inteira — a arte é cortada.
## Causa:
Em `card-detail-view.tsx`, a área da arte é um container de **altura fixa** (`h-72`) com a imagem em `object-cover` — como a arte oficial tem proporção de carta (~5:7), o `object-cover` corta as bordas. As imagens oficiais (`https://world.digimoncard.com/images/cardlist/card/<NUMBER>.png`) são a carta completa.
## O que alterar:
1. **`card-detail-view.tsx`**: trocar o container de altura fixa por **proporção de carta** (`aspect-[5/7]`, mesma usada na grade) e a imagem para **`object-contain`** (nunca cortar), sobre um fundo neutro/levemente escurecido para dar contraste. Manter o gradiente da cor + `Sparkles` como **fallback** quando `imageUrl` é ausente ou a imagem falha (`onError`) — comportamento já existente, preservar.
2. Manter `loading`/`decoding` adequados e `alt` com o nome da carta (acessibilidade).
3. Se a grade (`card-tile.tsx`) também estiver cortando, alinhar para `object-contain` (a grade já usa `aspect-[5/7]` — verificar se está `object-cover`; se a proporção bate, `object-cover` não corta, mas **uniformizar com a ficha** é desejável).
## Critério de conclusão:
- [ ] A arte inteira aparece na ficha (sem corte) para as cartas importadas
- [ ] Fallback (gradiente + Sparkles) continua funcionando quando não há arte/erro
- [ ] Proporção reservada (sem CLS)
- [ ] `pnpm turbo typecheck lint build --filter=@digimon/app-web` passando
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 71` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- apps/web/next-env.d.ts
- apps/web/public/dcg-logo.png
- apps/web/src/components/site-footer.tsx
- apps/web/src/components/site-header.tsx
- context/agents/queue/71-frontend-fix-ficha-arte-inteira.md
- context/agents/queue/72-frontend-fix-form-deck.md
- context/agents/queue/73-frontend-home-remover-torneios.md
- context/agents/queue/74-assets-logo-transparente.md
