# 30 — Comentários públicos: mostrar nome do autor em vez do id

## Agente: `agente-backend`
## Módulo: `comments`

## Descrição
A listagem pública de comentários retorna o `authorId` (UUID) e a View
`CommentItem` renderiza `comment.authorId` cru. O `listAll` (admin) já resolve o
nome do autor via `include: { author: { select: { name: true } } }` — espelhar
isso no `listByTarget` (público) e renderizar `authorName` na View.

## Escopo
- `packages/modules/comments/src/domain/repositories/comment-repository.ts`
- `packages/modules/comments/src/infra/repositories/prisma-comment-repository.ts`
- `packages/modules/comments/src/use-cases/list-comments/list-comments.ts`
- `packages/modules/comments/src/use-cases/list-comments/list-comments.spec.ts`
- `packages/modules/comments/src/test/memory-comment-repository.ts`
- `apps/web/src/features/comments/model/comments-api.ts`
- `apps/web/src/features/comments/views/comment-item.tsx`
- `apps/web/src/app/api/comments/route.ts`
- `context/modules/comments/status.md`
- `context/modules/web/status.md`

## Regras
- Fronteira: o módulo comments não importa @digimon/users — nome resolvido via
  join Prisma no repositório (como o listAll já faz)
- Specs atualizados: `items[0].body` → `items[0].comment.body`
- Typecheck + testes + lint ok

## Critério de conclusão:
- [ ] GET /api/comments devolve authorName
- [ ] CommentItem renderiza o nome (fallback "Autor removido")
- [ ] Testes do módulo comments passando
## Baseline (git)
- context/agents/queue/30-comments-authorname-publico.md
