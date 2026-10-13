# Task: web — home: seção "Próximos torneios" com dados reais
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/content/views/home-view.tsx`
- `apps/web/src/features/content/viewmodels/use-home.ts`
## Depende de: [ ] —
## Contexto para ler: context/modules/web/context.md, context/modules/content/context.md
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pedido do usuário:
"Os últimos notícias e torneios que tem no home funcionam?" → a seção de torneios foi removida (task 73) porque era hardcoded. O usuário quer a seção de volta, **com dados reais**.
## Referência (código original removido em `ccd9fc1`):
- Markup antigo: `<section>` com `<h2>Próximos torneios no Brasil</h2>` + `grid gap-5 lg:grid-cols-3` de `<TournamentCard>`.
- Os dados eram `UPCOMING_TOURNAMENTS` (hardcoded) no VM — **não** reintroduzir.
## Especificação:
1. `use-home.ts`: adicionar query react-query `['tournaments', { home: true }]` chamando
   `tournamentsApi.listTournaments({ status: 'published', from: <hoje ISO>, pageSize: 3 })`
   (import de `@/features/tournaments/model/tournaments-api`), mapeando com `toTournamentCardData`
   (de `@/features/tournaments/viewmodels`). Expor `tournaments` + estado (loading/erro) em `HomeData`.
2. `home-view.tsx`: reintroduzir a `<section>` "Próximos torneios no Brasil" com `<TournamentCard>`
   (`@/components`), com link "Ver todos" → `/torneios` (mesmo padrão visual do "Ver todas" das notícias).
   **Ocultar a seção** quando não houver torneios (sem placeholder falso) ou exibir skeleton discreto durante o loading.
3. Reaproveitar `toTournamentCardData` para mapear o `TournamentSummary` real — sem dados fake.
4. Não alterar as demais seções (Hero, categorias, últimas notícias, ads, CTA).
## Critério de conclusão:
- [ ] Home mostra "Próximos torneios no Brasil" com torneios reais publicados/futuros (`GET /tournaments`)
- [ ] Nenhum dado hardcoded de torneio
- [ ] Seção oculta quando a lista vier vazia
- [ ] `pnpm turbo typecheck --filter=@digimon/app-web` passando
- [ ] `git diff` restrito ao `## Escopo`
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 132` e registrar o handoff
## Complexidade: baixa/média

## Baseline (git)
- apps/api/src/container.ts
- apps/api/src/routes/comments.ts
- apps/web/src/features/comments/model/comments-api.ts
- apps/web/src/features/users/model/types.ts
- apps/web/src/features/users/views/profile-view.tsx
- context/modules/comments/status.md
- context/modules/web/status.md
- packages/modules/comments/src/domain/repositories/comment-repository.ts
- packages/modules/comments/src/index.ts
- packages/modules/comments/src/infra/repositories/prisma-comment-repository.ts
- packages/modules/comments/src/test/memory-comment-repository.ts
- apps/web/src/features/users/model/profile-activity-api.ts
- apps/web/src/features/users/viewmodel/use-profile-activity.ts
- context/agents/done/130-backend-comments-meus-comentarios.md
- context/agents/done/131-web-perfil-dados-reais.md
- context/agents/queue/132-web-home-proximos-torneios-reais.md
- context/agents/queue/133-web-noticias-autor-real.md
- context/agents/queue/134-web-remover-post-card-list-mortos.md
- packages/modules/comments/src/use-cases/list-my-comments/list-my-comments.spec.ts
- packages/modules/comments/src/use-cases/list-my-comments/list-my-comments.ts
