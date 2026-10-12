# Task: fix frontend — form de resultados: posição estável/sequencial
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/tournaments/views/tournament-results-form.tsx`
## Depende de: [ ] `88-frontend-torneio-detalhe.md`
## Contexto para ler: context/modules/tournaments/context.md + status.md
## Skills a carregar: codegen.md + frontend.md
## Pendência (nit apontado na revisão da task 88):
No form de resultados, as linhas usam `key={index}` e `addRow` calcula `position = rows.length + 1`. Se o usuário **remove uma linha do meio**, adicionar outra pode **repetir** a posição — e a `key` por índice pode causar reuso incorreto de inputs.
## O que fazer:
1. Dar **`id` estável** a cada linha (ex.: `crypto.randomUUID()` ou um contador), usando esse `id` como `key` do React.
2. Manter as **posições sequenciais** (1..n) automaticamente: renumerar ao adicionar/remover uma linha **ou** derivar a `position` da ordem no momento do submit (`index + 1`). Remover a possibilidade de posições duplicadas.
3. Preservar o comportamento atual: adicionar/remover linha, validação local (≥1 linha com `player`), envio via `useAddResults` (`POST /tournaments/:slug/results`), feedback sucesso/erro, `deck`/`record` opcionais (`null` quando vazios).
4. Opcional (se simples): permitir ordenar/duplicar linha. Manter a View só JSX (estado de UI).
## Critério de conclusão:
- [ ] `key` estável por linha; posições sempre sequenciais (sem duplicatas após remover/adicionar)
- [ ] Envio/validação/feedback preservados
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 92` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/active/89-web-logo-rodape-distorcao.md
- context/agents/active/90-frontend-torneio-editar.md
- context/agents/active/91-web-404-real-detalhes.md
- context/agents/queue/92-frontend-resultados-posicao.md
