# Task: fix web — logo do rodapé distorcida (stretch do flex column)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/components/site-footer.tsx`
- `apps/web/src/components/site-header.tsx`
## Depende de: [ ] `74-assets-logo-transparente.md`
## Contexto para ler: context/project/design, context/modules/web/context.md
## Skills a carregar: codegen.md + frontend.md
## Problema (medido no browser):
A logo do rodapé aparece **distorcida** (esticada na horizontal). Diagnóstico:
- O `<Image>` do rodapé tem `class="h-[38px] w-auto"` dentro de um container **`flex flex-col`** (`max-w-xs`). Em flex-column, o eixo cruzado é **horizontal** e o `align-items: stretch` (default) **estica** o item → largura computada **320px** com altura **38px** → `renderAspect 8.421` vs `naturalAspect 3.523` (a arte tem 937×266). O header (flex **row**) fica correto (127×36, aspecto preservado).
## O que fazer:
1. **`site-footer.tsx`**: impedir o stretch da imagem — ex.: `self-start` no `<Image>` (ou `items-start` no container vertical). Garantir **aspecto preservado** (testar que a largura renderizada ≈ `altura × (937/266)`), mantendo a altura desejada (`h-[38px]`) e `w-auto`. Alternativa aceitável: `object-contain`. **Meta:** `renderAspect ≈ 3.52`.
2. **`site-header.tsx`**: confirmar que a logo do header continua correta (já OK) — só ajustar se necessário. Não mudar o layout do header.
3. Manter `width`/`height` = 937×266 (corretos) e acessibilidade (`alt`).
## Critério de conclusão:
- [ ] Rodapé: logo com aspecto preservado (largura ≈ 134px para 38px de altura), sem stretch
- [ ] Header: logo correta (127×36 approx), inalterada
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 89` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/queue/89-web-logo-rodape-distorcao.md
- context/agents/queue/90-frontend-torneio-editar.md
- context/agents/queue/91-web-404-real-detalhes.md
- context/agents/queue/92-frontend-resultados-posicao.md
