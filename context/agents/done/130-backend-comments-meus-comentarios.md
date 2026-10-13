# Task: backend — comentários do próprio autor (GET /comments?mine=true)
## Agente: `agente-backend`
## Módulo: `packages/modules/comments` + `apps/api`
## Escopo (arquivos que esta task vai tocar):
- `packages/modules/comments/src/domain/repositories/comment-repository.ts`
- `packages/modules/comments/src/infra/repositories/prisma-comment-repository.ts`
- `packages/modules/comments/src/test/memory-comment-repository.ts`
- `packages/modules/comments/src/use-cases/list-my-comments/list-my-comments.ts` (novo)
- `packages/modules/comments/src/use-cases/list-my-comments/list-my-comments.spec.ts` (novo)
- `packages/modules/comments/src/index.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/container.ts`
## Depende de: [ ] —
## Contexto para ler: context/modules/comments/context.md, context/modules/comments/status.md
## Skills a carregar: codegen.md + backend.md
## Pedido do usuário:
"Tela de perfil: quero os dados reais" — os comentários do próprio autor não têm endpoint hoje.
## Diagnóstico:
- `GET /comments` exige `targetType`+`targetId`; `GET /comments/admin` é admin/editor-only.
- Não há listagem dos comentários do próprio autor.
## Especificação:
1. Adicionar ao repositório um método `listByAuthor` (params: `authorId`, `page?`, `pageSize?`, `status?`) retornando `PaginatedResult<CommentWithAuthor>`; implementar no Prisma e no in-memory de teste.
2. Novo use case `ListMyCommentsUseCase` (dir `use-cases/list-my-comments/`), com `actor` obrigatório e filtro padrão `status: 'visible'` (decidido: o perfil mostra só comentários visíveis do titular); aceitar `page`/`pageSize`.
3. Rota: em `GET /comments`, quando `mine === 'true'`, exigir sessão (401 se ausente) e delegar ao novo use case, mantendo o **mesmo shape de resposta** do `serializeComment` (`{ items, total, page, pageSize }`). Sem `mine`, comportamento atual inalterado.
4. Wire-up em `container.ts` (`commentsDeps().listMine`).
5. Exportar o novo use case + tipos no `index.ts` do módulo. Adicionar spec do use case (autor só vê os próprios; paginação; filtro visible).
## Critério de conclusão:
- [ ] `GET /comments?mine=true` autenticado retorna os comentários visíveis do próprio autor (paginado, com `authorName`)
- [ ] Sem `mine=true`, a rota não muda
- [ ] Testes do módulo comments passando
- [ ] `pnpm turbo typecheck` passando (api + módulo)
- [ ] `git diff` restrito ao `## Escopo`
## Ao terminar: atualizar `context/modules/comments/status.md`, rodar `pnpm harness finish 130` e registrar o handoff
## Complexidade: baixa/média

## Baseline (git)
- context/agents/queue/130-backend-comments-meus-comentarios.md
- context/agents/queue/131-web-perfil-dados-reais.md
