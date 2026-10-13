# Task: web — remover código morto de posts (post-card/post-list)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/content/views/post-card.tsx` (remover)
- `apps/web/src/features/content/views/post-list.tsx` (remover)
## Depende de: [ ] —
## Contexto para ler: context/modules/web/context.md
## Skills a carregar: codegen.md + frontend.md
## Pedido do usuário:
Remover código morto detectado na revisão da home.
## Diagnóstico:
- `views/post-list.tsx` (`PostList`) **não é importado por ninguém**.
- `views/post-card.tsx` (`PostCard`) só é usado por `post-list.tsx`.
- Ambos usam tokens de design antigos (`bg-card`, `text-muted-foreground`, `bg-muted`, `destructive`) e **não** estão no barrel `views/index.ts`.
- O que está em uso é o `PostCard` do design system (`@/components/post-card`) via `NewsGrid` — **não tocar**.
- Atenção: `use-post-list.ts` (viewmodel) continua em uso por `use-news-list.ts` — **não remover**.
## Especificação:
- Remover os 2 arquivos. Nenhuma outra alteração.
## Critério de conclusão:
- [ ] `PostList` e o `PostCard` legado de `features/content/views` removidos
- [ ] Nenhum import restante de `./post-card` / `./post-list`
- [ ] `pnpm turbo typecheck --filter=@digimon/app-web` passando
- [ ] `git diff` restrito ao `## Escopo`
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 134` e registrar o handoff
## Complexidade: baixa

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
- context/agents/active/132-web-home-proximos-torneios-reais.md
- context/agents/active/133-web-noticias-autor-real.md
- context/agents/done/130-backend-comments-meus-comentarios.md
- context/agents/done/131-web-perfil-dados-reais.md
- context/agents/queue/134-web-remover-post-card-list-mortos.md
- packages/modules/comments/src/use-cases/list-my-comments/list-my-comments.spec.ts
- packages/modules/comments/src/use-cases/list-my-comments/list-my-comments.ts
