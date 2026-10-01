# @digimon/comments — Contexto do Módulo

## Responsabilidade
Comentários em conteúdo (posts), cartas e decks. **Somente com conta logada** (Member/Editor/Administrator). Essencial para a v1.

## Entidades
- **Comment** — id, authorId, targetType (post | card | deck), targetId, body, status (visible | hidden | deleted), createdAt, updatedAt
- **CommentModeration** — status de moderação (auto/manual) quando necessário

## Use Cases
- `CreateCommentUseCase` — comenta em post/carta/deck (requer login; `UnauthorizedError` para anônimo)
- `ListCommentsUseCase` — listagem pública por target (paginada; apenas `visible`)
- `UpdateCommentUseCase` — autor edita próprio comentário (`ForbiddenError` para não-autor)
- `DeleteCommentUseCase` — autor remove próprio; Admin/Editor remove qualquer (soft-delete → status `deleted`)
- `ModerateCommentUseCase` — Admin/Editor oculta (`hide`) ou exibe (`show`) qualquer comentário

## Eventos que Publica
- `comment.created` (CreateCommentUseCase)
- `comment.hidden` (ModerateCommentUseCase — ação hide)
- `comment.deleted` (DeleteCommentUseCase)
- Payload dos eventos: `{ commentId, authorId, targetType, targetId }` (implementam `DomainEvent` de `@digimon/contracts`)

## Eventos que Consome
- Nenhum

## Dependências
- `@digimon/contracts` (tipos, erros, eventos, EventBus)
- `@prisma/client` (infra/repositório — schema raiz `prisma/schema.prisma` já possui `Comment` + enums)

## Repositórios
- `ICommentRepository` (domínio) — `PrismaCommentRepository` (infra, em `src/infra/repositories/`)
- Singleton `prisma` em `src/infra/prisma.ts` (cache em `globalThis`, padrão Next.js dev)

## Rotas (Route Handlers em apps/web)
- `GET /api/comments?targetType=&targetId=&page=&pageSize=` — listagem pública por target
- `POST /api/comments` — cria comentário (exige login)
- `PATCH /api/comments/:id` — autor edita o próprio
- `DELETE /api/comments/:id` — autor remove o próprio; Admin/Editor qualquer
- `POST /api/comments/:id/moderate` `{ action: 'hide' | 'show' }` — Admin/Editor

## Regras
- **Comentário exige conta logada** — anônimo não comenta (`UnauthorizedError`)
- Autor edita/remove apenas comentários próprios; Admin/Editor moderam qualquer
- Moderação: Admin/Editor podem ocultar (status hidden) sem apagar histórico
- Alvo pode ser post, carta ou deck (targetType + targetId)
- Listagem pública expõe somente comentários `visible`

## Autenticação (integrada com task 02-auth)
- `getSessionUser(request)` em `apps/web/src/app/api/comments/_lib/session.ts` lê o
  access token (cookie httpOnly `access_token` via `readAccessToken`, ou header
  `Authorization: Bearer` via `extractBearerToken`) e valida com `verifyJwt`
  (`@digimon/auth`) → retorna `CommentActor { userId, role } | null`.
- Sem token → `null` (anônimo) → use cases lançam `UnauthorizedError` (401).
  Token inválido/expirado → `verifyJwt` lança `UnauthorizedError` (401).
- `GET` (listagem pública) não exige autenticação.