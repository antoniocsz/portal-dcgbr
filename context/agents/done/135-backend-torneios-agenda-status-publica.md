# Task: backend — agenda pública de torneios: honrar status (published/finished), nunca cancelled
## Agente: `agente-backend`
## Módulo: `packages/modules/tournaments`
## Escopo (arquivos que esta task vai tocar):
- `packages/modules/tournaments/src/use-cases/list-tournaments.ts`
- `packages/modules/tournaments/src/use-cases/tournament-workflow.spec.ts`
## Depende de: [ ] —
## Contexto para ler: context/modules/tournaments/context.md, context/modules/tournaments/status.md
## Skills a carregar: codegen.md + backend.md
## Problema reportado pelo usuário:
"Na tela torneios, os filtros de próximos, finalizados e cancelados estão funcionais?" → **Não**: em `ListTournamentsUseCase` (linha ~41), para quem não é Admin/Editor a listagem **força `status: 'published'`** e ignora o status pedido. Efeito: as abas "Finalizados"/"Cancelados" não mudam nada, e um torneio **desaparece da agenda ao virar `finished`** (registrar resultados) — embora o domínio o considere público (`isPubliclyVisible()` = published || finished; o detalhe libera finished).
## Especificação:
1. Na listagem **não-editorial** (nem `mine`, nem Admin/Editor), aceitar o status pedido quando for `published` ou `finished`; qualquer outro valor (incl. `cancelled` ou ausente) → `published` (default atual preservado). `cancelled` **nunca** aparece para o público (regra do domínio mantida).
2. Manter intacto o comportamento para `mine` (dono vê qualquer status) e para Admin/Editor (qualquer status).
3. Ajustar/estender os testes (`tournament-workflow.spec.ts`) cobrindo: público pedindo `finished` recebe finished; público pedindo `cancelled` recebe apenas published (não vaza); default = published; `mine` continua vendo cancelados.
## Critério de conclusão:
- [ ] `GET /tournaments?status=finished` (anônimo/logado não-editor) retorna finalizados
- [ ] `GET /tournaments?status=cancelled` (público) continua sem vazar cancelados
- [ ] Default e `mine`/manager inalterados
- [ ] Testes do módulo tournaments passando
- [ ] `pnpm turbo typecheck` passando (api + módulo)
- [ ] `git diff` restrito ao `## Escopo`
## Ao terminar: atualizar `context/modules/tournaments/status.md`, rodar `pnpm harness finish 135` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/queue/135-backend-torneios-agenda-status-publica.md
- context/agents/queue/136-web-torneios-filtros-funcionais.md
- context/agents/queue/137-backend-cards-busca-por-codigo.md
- context/agents/queue/138-web-cards-busca-placeholder-codigo.md
