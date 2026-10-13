# Task: web — home/listagem: autor real nos cards de notícia
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/content/model/types.ts`
- `apps/web/src/features/content/viewmodels/post-view.ts`
## Depende de: [ ] —
## Contexto para ler: context/modules/web/context.md, context/modules/content/context.md
## Skills a carregar: codegen.md + frontend.md
## Pedido do usuário:
Nos cards de notícia (home, `/noticias`, artigo) o autor exibido é fixo (`PORTAL_AUTHOR = 'Equipe DigiTCG'`), apesar de a API já retornar `authorId`/`authorName` reais em `GET /posts` (ver `apps/api/src/routes/content.ts` — `serializePostSummary` inclui `authorId`/`authorName` quando resolvido).
## Especificação:
1. `model/types.ts`: adicionar `authorId?: string` e `authorName?: string` a `PostSummary`
   (a API só os envia quando o nome é resolvível).
2. `viewmodels/post-view.ts`: usar o autor real quando existir —
   `post.authorName?.trim() || PORTAL_AUTHOR` — em **`toFeaturedPostView`** (Hero) e **`toPostCardData`** (cards).
   Manter `PORTAL_AUTHOR` apenas como fallback (não remover).
3. Não alterar o design dos cards nem o layout (`PostCardData` já tem `authorName`).
## Critério de conclusão:
- [ ] Cards e hero exibem o `authorName` real quando a API o fornece; fallback mantido
- [ ] `pnpm turbo typecheck --filter=@digimon/app-web` passando
- [ ] `git diff` restrito ao `## Escopo`
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 133` e registrar o handoff
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
- context/agents/done/130-backend-comments-meus-comentarios.md
- context/agents/done/131-web-perfil-dados-reais.md
- context/agents/queue/133-web-noticias-autor-real.md
- context/agents/queue/134-web-remover-post-card-list-mortos.md
- packages/modules/comments/src/use-cases/list-my-comments/list-my-comments.spec.ts
- packages/modules/comments/src/use-cases/list-my-comments/list-my-comments.ts
