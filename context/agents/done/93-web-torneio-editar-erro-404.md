# Task: fix frontend — editar torneio: não dar 404 falso em erro transitório
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/app/(member)/torneios/[slug]/editar/page.tsx`
## Depende de: [ ] `90-frontend-torneio-editar.md`, `91-web-404-real-detalhes.md`
## Contexto para ler: context/modules/tournaments/context.md, context/modules/web/context.md, ADR-007
## Skills a carregar: codegen.md + frontend.md
## Pendência (apontada na revisão do Lote 12):
Na página `(member)/torneios/[slug]/editar`, o `fetchTournament` SSR retorna `null` para **qualquer** `!ok` e o corpo chama `notFound()`. Assim, se a API estiver **fora do ar** (500/timeout), um dono legítimo recebe **HTTP 404** em vez de um erro. Inconsistente com o padrão **discriminado** (`ok | not-found | error`) introduzido na task 91 nas páginas de detalhe.
## O que fazer:
1. Alinhar o fetch SSR desta página ao padrão da task 91: distinguir **`not-found`** (404 da API) de **`error`** (transitório: 5xx/timeout/exceção).
   - `not-found` → `notFound()` (404 real).
   - `error` → **não** chamar `notFound()`; renderizar a View de edição (o client tratará o erro de fetch) — ou um estado de erro claro, se preferir e for simples.
   - Sem cookie/não autorizado → comportamento atual (redirect/404 conforme a task 90).
2. Não alterar o ViewModel/View do form.
## Critério de conclusão:
- [ ] Erro transitório da API **não** resulta em 404 (renderiza a View/erro)
- [ ] Torneio inexistente/terceiro-cancelado continua 404; dono continua 200
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 93` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/queue/93-web-torneio-editar-erro-404.md
