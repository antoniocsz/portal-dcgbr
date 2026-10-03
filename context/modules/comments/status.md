# @digimon/comments — Status

## Fase 1 — Fundação (task 04-module-comments)
- [x] Domain entity `Comment` (factory `create`/`from`, invariantes: body obrigatório ≤ 2000, soft-delete, hide/show)
- [x] Repository interface `ICommentRepository` (create, findById, update, listByTarget paginada)
- [x] Use cases (DIP): CreateComment, ListComments, UpdateComment, DeleteComment, ModerateComment
- [x] Ator de domínio `CommentActor` + `canModerate` (administrator | editor)
- [x] Eventos `comment.created` / `comment.hidden` / `comment.deleted` via EventBus (in-process, ADR-005)
- [x] Implementação Prisma (`PrismaCommentRepository` + singleton `prisma`) — schema raiz já possuía `Comment`
- [x] Testes unitários (vitest): 21 testes — anônimo não comenta; autor não edita de outro; Admin/Editor moderam; listagem paginada por target
- [x] Route handlers: GET/POST `/api/comments`, PATCH/DELETE `/api/comments/:id`, POST `/api/comments/:id/moderate`
- [x] Barrel export `src/index.ts` atualizado (só público)
- [x] Typecheck: `pnpm turbo typecheck --filter=@digimon/comments` passando
- [x] Testes: `pnpm turbo test --filter=@digimon/comments` — 5 files / 21 tests passando
- [x] Lint: `pnpm turbo lint --filter=@digimon/comments` passando
- [ ] Testes de integração (Prisma + DB real) — pendente, task futura

## Fase 2 — Refinamentos
- [x] Integração de eventos (EventBus in-process) nos use cases
- [x] UI/frontend (MVVM estrito): `features/comments/{model,viewmodels,views}`
- [x] `getSessionUser()` real via `verifyJwt` + `extractBearerToken`/`readAccessToken` (@digimon/auth) — correção do review
- [x] Imports do web migrados para barrels nomeados (`@digimon/comments`, `@digimon/contracts`) — correção do review
- [x] Typecheck do app-web para arquivos de comments: passando
- [ ] Typecheck global do app-web: **bloqueado por erros pré-existentes em `features/content/**` (task 03 ativa)** — fora do escopo desta task

## Handoff
- [x] Preenchido ao finalizar cada task: feito / pendências / decisões

### Feito
- Módulo `@digimon/comments` completo: entidade `Comment`, `ICommentRepository`, 5 use cases (DIP), eventos via EventBus, `PrismaCommentRepository`, barrel público.
- Rotas `/api/comments/**` (list/create/update/delete/moderate) com tradução `AppError` → HTTP.
- UI `features/comments/**` em MVVM estrito (model + viewmodel com react-query + views).
- 21 testes unitários cobrindo os 4 critérios da task (anônimo, autor vs outro, moderação Admin/Editor, listagem paginada).
- Typecheck/test/lint do módulo passando; lint e typecheck dos arquivos de comments no web passando.

### Correção do review (devolução do reviewer)
- **`getSessionUser()` real:** o stub que retornava `null` foi substituído por leitura do
  access token (cookie httpOnly `access_token` via `readAccessToken` + fallback header
  `Authorization: Bearer` via `extractBearerToken`) e validação com `verifyJwt`
  (`@digimon/auth`). Retorna `CommentActor { userId, role } | null` — tipagem estrutural
  idêntica ao `AuthContext` do auth. Fluxo garantido: anônimo → 401/`UnauthorizedError`
  (sem token → use case rejeita; token inválido/expirado → `verifyJwt` lança 401);
  Member/Editor/Admin logado → cria comentário; autor edita/remove próprios;
  Admin/Editor moderam qualquer (regras já testadas nos 21 testes do domínio).
- **Imports migrados para barrels nomeados:** removidos os caminhos relativos profundos
  (`../../../../../../../packages/...`) em `session.ts`, `http.ts`, `route.ts` e
  `moderate/route.ts` → `@digimon/comments`, `@digimon/contracts` (já presentes no
  `package.json` do web) e `@/lib/server/{container,http}` (padrão da task 02).
- **List pública só `visible`:** confirmado — `PrismaCommentRepository.listByTarget`
  filtra `status: 'VISIBLE'` por padrão e o `GET /api/comments` não envia `status`;
  `GET` continua público (sem autenticação).

### Pendências
- **Bloqueio externo:** typecheck e lint totais de `apps/web` falham por erros em `apps/web/src/features/content/**` (task 03-module-content, ativa). Não toquei nesses arquivos (fora do escopo). `post-form.tsx` tem `TS2339` (value em EventTarget) e lint errors — pertencem à task 03.
- Testes de integração (Prisma/DB real) não incluídos nesta task (sem banco disponível).
- `pnpm-lock.yaml` foi atualizado pelo `pnpm install` (registra o novo workspace package `@digimon/comments`) — está no baseline da task.

### Decisões
- **Auth nos handlers:** `_lib/session.ts` segue o mesmo padrão das rotas `api/users/**`
  (task 02): `authDeps().tokens` (JWT HS256 via `JwtTokenService`) + `verifyJwt`.
  O domínio continua recebendo `CommentActor | null` via DIP — a integração ficou só no
  handler, sem tocar nos use cases (conforme decisão da task 04 original).
- **Imports do web para o módulo via barrels nomeados** (`@digimon/comments`,
  `@digimon/contracts`): o padrão de dependência no `package.json` do web foi definido
  pelas tasks 02/03 com `pnpm install` — deep imports relativos removidos nesta correção.
- **Sem tenantId**: projeto não multi-tenant (ADR-004) — queries por targetType+targetId apenas.
- **Soft-delete**: `DeleteCommentUseCase` marca `status = deleted` (histórico preservado); moderação usa `hidden`.
- **Listagem pública** expõe apenas `visible` (ocultos/removidos não aparecem).
- **Validação no handler**: sem Zod ainda (não está nas deps do web) — validação mínima manual + invariantes de domínio no use case. Zod entra quando a task 02 definir o padrão de validação.
## Fase 3 — Listagem global para moderação (task 20-backend-comments-admin-authorname)
- [x] `CommentRepository.listAll` (interface) — qualquer status + autor
- [x] `PrismaCommentRepository.listAll` — `include: { author: { select: { name } } }`, filtros status/targetType, paginação
- [x] `ListAllCommentsUseCase` — valida `canModerate` (admin|editor) no domínio (ForbiddenError)
- [x] Rota `GET /api/comments/admin` (admin|editor) — retorna itens com `authorName`
- [x] Testes: 3 novos (24 total) — admin lista todos, filtro por status, member bloqueado
- [x] Typecheck + lint ok

## Handoff (task 20)
- **Feito:** listagem global de comentários para moderação com nome do autor; rota admin validada E2E (200 com authorName; 401 sem sessão).
- **Pendências:** painel admin de comentários (feature) ainda usa amostra do Model — task 21-frontend-admin-comments-barrel vai conectar à API real.
- **Decisões:** o use case valida a role no domínio (defense in depth); o handler monta o input condicionalmente (exactOptionalPropertyTypes).

## Fase 4 — authorName na listagem pública (task 30)
- [x] `listByTarget` agora retorna `CommentWithAuthor` (join `author: { select: { name } }` no Prisma, como o listAll)
- [x] Interface do repositório e use case `ListComments` atualizados
- [x] GET /api/comments aplanava os itens com authorName
- [x] Web: CommentDTO com authorName; CommentItem renderiza o nome (não o UUID)
- [x] Memory repo + specs atualizados; testes 6 files / 24 testes passando
- [x] E2E: listagem pública devolve "authorName":"Administrator"

## Handoff (task 30)
- **Feito:** comentários públicos mostram o nome do autor. Fronteira preservada (join no repo, sem import de @digimon/users).
- **Pendência/nota:** resposta do POST/PATCH de comentário serializa a entidade crua (`_body`, `_status`) — irrelevante para render (a View faz refetch via invalidateQueries), mas pode ser limpo num futuro task de "serialização de entidades".
