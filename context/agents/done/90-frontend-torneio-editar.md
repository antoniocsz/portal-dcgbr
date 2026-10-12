# Task: frontend — editar dados do torneio (`/torneios/[slug]/editar`)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/app/(member)/torneios/[slug]/editar/page.tsx` (novo)
- `apps/web/src/features/tournaments/views/tournament-form-view.tsx`
- `apps/web/src/features/tournaments/viewmodels/use-tournament-form.ts`
- `apps/web/src/features/tournaments/views/tournament-detail-view.tsx`
- `apps/web/src/features/tournaments/views/index.ts`
## Depende de: [ ] `88-frontend-torneio-detalhe.md`
## Contexto para ler: context/modules/tournaments/context.md + status.md, context/modules/web/context.md
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pendência:
O `PATCH /tournaments/:slug` existe, mas não há UI para editar os dados do torneio (nome, descrição, formato, local, datas). O criador/Admin/Editor deve poder editar.
## O que fazer:
1. **Modo edição no `use-tournament-form.ts`**: aceitar `{ mode: 'create' | 'edit', slug?, initial? }`; em `edit` carrega o torneio (`tournamentsApi.getTournament`) e salva via `tournamentsApi.updateTournament` (PATCH) em vez de `createTournament`. Manter validação/normalização existentes.
2. **`tournament-form-view.tsx`**: aceitar props de edição (`mode`/`slug`), ajustar título/CTA ("Salvar alterações"); sem quebrar o fluxo de criação.
3. **Rota** `apps/web/src/app/(member)/torneios/[slug]/editar/page.tsx`: Server Component sob `(member)` (gate de login do grupo), container largo, **gate de dono** (organizador/Admin/Editor): buscar o torneio com o **cookie da sessão** (padrão das tasks 85/86); inexistente → `notFound()`; não autorizado → `redirect('/torneios/' + slug)`. (Torneio cancelado não é editável — `PATCH` rejeita; tratar com feedback.)
4. **`tournament-detail-view.tsx`**: adicionar o link **Editar** (`/torneios/{slug}/editar`) para o organizador/Admin/Editor (só quando `canManage` e `status !== 'cancelled'`).
5. **Barrel** `views/index.ts` se necessário.
## Especificação:
- MVVM estrito; reusar `tournamentsApi.updateTournament`.
- Não quebrar o fluxo de criação (`mode: 'create'` default).
## Critério de conclusão:
- [ ] `/torneios/{slug}/editar` carrega e salva via PATCH; gate de dono (não-autorizado → redirect; inexistente → 404)
- [ ] Detalhe mostra o link Editar para quem gerencia (e some para cancelado/visitante)
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md` e `context/modules/tournaments/status.md`, rodar `pnpm harness finish 90` e registrar o handoff
## Complexidade: alta

## Baseline (git)
- context/agents/active/89-web-logo-rodape-distorcao.md
- context/agents/queue/90-frontend-torneio-editar.md
- context/agents/queue/91-web-404-real-detalhes.md
- context/agents/queue/92-frontend-resultados-posicao.md
