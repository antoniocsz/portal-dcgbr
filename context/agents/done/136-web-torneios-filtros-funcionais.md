# Task: web — /torneios: filtros funcionais (Todos/Próximos/Finalizados, sem Cancelados)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/tournaments/views/tournaments-list-view.tsx`
- `apps/web/src/features/tournaments/viewmodels/use-tournament-list.ts`
- `apps/web/src/app/(public)/torneios/page.tsx`
## Depende de: [ ] — a task 135 (backend) habilita `status=finished` para o público, em paralelo
## Contexto para ler: context/modules/web/context.md, context/modules/tournaments/context.md
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pedido do usuário:
Os filtros de `/torneios` não funcionam; e não deve haver aba de cancelados na agenda pública.
## Decisão do usuário (exata):
- **Todos** (default) = publicados, **sem** filtro de data.
- **Próximos** = publicados **a partir de hoje** (`from=<hoje ISO>`).
- **Finalizados** = `status=finished`.
- **Cancelados: remover** da agenda pública (cancelled não é público).
- Manter a aba/opção "Cancelados" **apenas quando `mine`** (dono vê os próprios cancelados).
## Especificação:
1. `tournaments-list-view.tsx`: abas **Todos · Próximos · Finalizados** (sem Cancelados quando `!mine`; com Cancelados só quando `mine`). Cada aba deve produzir parâmetros reais distintos para o VM (`ListTournamentsParams`): Todos → sem `status`/`from`; Próximos → `status: 'published'` + `from: <hoje ISO>`; Finalizados → `status: 'finished'`.
2. `use-tournament-list.ts`: garantir que `from` chega ao `tournamentsApi.listTournaments` (o Model já suporta `from`).
3. `app/(public)/torneios/page.tsx`: parsear o filtro da URL para o `status`/`from` correspondentes, mantendo URL canônica e sem quebrar SEO; **atualizar o metadata** (hoje anuncia "próximos, finalizados e cancelados" — remover "cancelados").
4. Não alterar a renderização dos cards nem outras telas.
## Critério de conclusão:
- [ ] Cada aba muda de fato a lista (Todos/Próximos/Finalizados)
- [ ] Sem aba "Cancelados" na página pública (mantida em `mine`)
- [ ] Metadata sem menção a cancelados
- [ ] `pnpm turbo typecheck --filter=@digimon/app-web` passando
- [ ] `git diff` restrito ao `## Escopo`
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 136` e registrar o handoff
## Complexidade: média

## Baseline (git)
- context/agents/active/135-backend-torneios-agenda-status-publica.md
- context/agents/queue/136-web-torneios-filtros-funcionais.md
- context/agents/queue/137-backend-cards-busca-por-codigo.md
- context/agents/queue/138-web-cards-busca-placeholder-codigo.md
