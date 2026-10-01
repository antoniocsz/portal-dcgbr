# @digimon/contracts — Status

## Fase 1 — Fundação (task 01-monorepo-contracts)
- [x] Pacote `@digimon/contracts` criado (renomeado de `@saas/contracts`) — camada mais baixa, zero deps
- [x] Hierarquia de erros: `AppError` + `ValidationError`/`UnauthorizedError`/`ForbiddenError`/`NotFoundError`/`ConflictError`
- [x] Tipos compartilhados: `EntityId` (branded), enums globais (`Role`, `PostStatus`, `PostCategory`, `CommentStatus`, `CommentTargetType`), `PaginatedResult`, `ListParams`
- [x] `DomainEvent` + `EventBus` com `InMemoryEventBus` (pub/sub in-process desacoplado — ADR-005)
- [x] Barrel `src/index.ts` exporta só o público
- [x] Monorepo renomeado `@saas` → `@digimon` (zero resquícios em código ativo)
- [x] `apps/api` (Fastify) removido (ADR-001)
- [x] Prisma schema raiz (User, RefreshToken, PasswordResetToken, Post, Comment + enums) validado e client gerado
- [x] Setup base `apps/web`: Next.js App Router + Tailwind v4 + shadcn/ui (components.json) + `src/features/<módulo>/**`
- [ ] Testes unitários (erros/EventBus) — pendente, task futura
- [ ] Testes de integração — pendente, task futura

## Fase 2 — Refinamentos
- [ ] Fila persistida para eventos (reavaliar quando houver volume — ADR-005 in-process na v1)
- [ ] UI/frontend por módulo (MVVM) — via tasks 02+
- [x] Typecheck: `pnpm turbo typecheck` — 3/3 pacotes passando
- [x] Lint: `pnpm turbo lint` — 3/3 pacotes passando

## Handoff
- **Feito:** task 01 concluída — `@digimon/contracts` com erros/tipos/EventBus funcionando; monorepo 100% `@digimon`; `apps/api` removido; prisma schema raiz (críticos v1); setup base do web com Tailwind v4 + shadcn/ui + features por módulo; CI alinhado; harness alinhado.
- **Pendências:** testes unitários de contracts; `apps/web` sem componentes shadcn reais ainda (só config base); `packages/api-client` ainda carrega `tenantId`/`x-tenant-id` da stack antiga (resquício funcional — limpar quando o frontend consumir APIs); `harness init` templates ainda geram módulos tenancy/authorization/audit (conteúdo do template, apenas escopo renomeado).
- **Decisões:** extensão do `## Escopo` para `packages/api-client`, `.github/workflows/ci.yml`, `scripts/harness`, `.gitignore`, `AGENTS.md` e `pnpm-lock.yaml` (renomeação completa exigida pelo critério "sem resquícios @saas"); prisma na raiz (não `packages/prisma`); `.env` local ignorado (DATABASE_URL placeholder); Tailwind v4 com `@theme inline` (padrão shadcn 2026); `Comment` sem relação FK para `Post` (target polimórfico targetType+targetId).