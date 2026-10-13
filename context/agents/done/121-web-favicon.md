# Task: web — favicon a partir da logo (icon.png, apple-icon.png, favicon.ico)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/app/icon.png` (novo)
- `apps/web/src/app/apple-icon.png` (novo)
- `apps/web/src/app/favicon.ico` (novo)
## Depende de: [ ] —
## Contexto para ler: context/project/design, context/modules/web/context.md
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pedido do usuário:
"Criar o favicon com base na logo."
## Fonte e medições (já analisadas com PIL):
- Asset: `apps/web/public/dcg-logo.png` — **937×266 RGBA**, fundo transparente.
- A logo tem "**DCG**" (topo) e "**BRASIL**" (base), separados por uma lacuna horizontal em **y≈196**.
- **Bbox do "DCG"**: `(x0=125, y0=0, x1=838, y1=197)` → 713×197 (aspecto ≈3.6). Bbox total: `(125,0,838,266)`.
- Cor dominante (navy da arte): ~**`rgb(8,18,58)`** (variações (3,11,50)–(16,29,82)).
## O que gerar (Next.js App Router — `apps/web/src/app/`):
1. **`icon.png`** — 512×512, **quadrado**, com **fundo navy sólido** (`rgb(8,18,58)`) e o **recorte do "DCG"** (bbox acima) centralizado, escalado para ocupar ~**88% da largura** (mantendo o aspecto). Use Python PIL (disponível).
2. **`apple-icon.png`** — 180×180, mesma composição.
3. **`favicon.ico`** — 32×32 (mesma composição) para navegadores legados (PIL grava `.ico`).
4. Garanta que o mark fique **nítido** (use `Image.LANCZOS` no resize) e com uma pequena margem uniforme.
5. Alternativa aceitável se preferir mais legibilidade: usar a **logo inteira** (bbox total) em vez do recorte do DCG — mas o recorte do DCG é preferível (tira o "BRASIL").
## Especificação:
- Não alterar `next.config.ts` nem o `layout.tsx` (o Next detecta `app/icon.png`/`apple-icon.png`/`favicon.ico` automaticamente).
- Manter `apps/web/public/dcg-logo.png` como está (usado no header/rodapé).
- Só assets — sem código.
## Critério de conclusão:
- [ ] `icon.png` (512×512), `apple-icon.png` (180×180) e `favicon.ico` (32×32) criados a partir da logo
- [ ] Quadrado, fundo navy, mark centralizado e nítido
- [ ] `pnpm turbo build --filter=@digimon/app-web` passando (confirma que o Next reconhece os ícones)
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 121` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/queue/121-web-favicon.md
- context/agents/queue/122-tooling-import-catalog-cli.md
