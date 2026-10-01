# Task: Fundação monorepo + @digimon/contracts
## Agente: `agente-backend`
## Módulo: `packages/contracts` (escopo `@digimon`)
## Escopo (arquivos que esta task vai tocar):
- `packages/contracts/**`
- `packages/modules/**`
- `packages/api-client/**`
- `apps/web/**`
- `apps/api/**`
- `prisma/**`
- `pnpm-workspace.yaml`
- `turbo.json`
- `package.json`
- `pnpm-lock.yaml`
- `.github/workflows/ci.yml`
- `scripts/harness/**`
- `.gitignore`
- `AGENTS.md`
- `context/modules/contracts/**`

Notas de escopo (justificativas):
- `packages/api-client`, `.github/workflows/ci.yml`, `scripts/harness`, `pnpm-lock.yaml`: renomeação `@saas` → `@digimon` em todo o monorepo (critério "sem resquícios @saas"); CI referenciava `@saas/prisma` (pacote inexistente); harness geraria `@saas/*` nas próximas tasks; lockfile muda com o install do setup web/prisma.
- `.gitignore`: ignorar `*.tsbuildinfo` (artefato do typecheck incremental do web).
- `AGENTS.md`: bloco `turborepo-agent-rules` re-adicionado automaticamente pelo turbo (mudança da ferramenta, mantida conforme instrução do próprio bloco).
## Depende de: [ ] `-`
## Contexto para ler: context/project/overview.md, context/project/stack.md, context/modules/contracts/context.md
## Skills a carregar: codegen.md + backend.md + architecture.md
## O que já existe: scaffold do monorepo (Turborepo + pnpm, apps/api, apps/web, packages/contracts vazio)
## O que criar:
- Pacote `@digimon/contracts` (packages/contracts) — renomear de `@saas/*` para `@digimon/*`
- Hierarquia de erros: `AppError`, `NotFoundError`, `ForbiddenError`, `ValidationError`, `ConflictError`, `UnauthorizedError`
- Tipos compartilhados (identificadores, enums globais: roles, status de post, targetType de comentário)
- `DomainEvent` + `EventBus` (pub/sub in-process, desacoplado)
- Barrel `src/index.ts` exporta só o público
## Especificação:
- Camada mais baixa: zero dependências de outros módulos
- Renomear escopo `@saas` → `@digimon` em todos os package.json/imports do monorepo
- **Remover `apps/api` (Fastify)** — ADR-001: backend integrado no Next.js
- Setup base do `apps/web`: Next.js App Router + Tailwind + shadcn/ui + estrutura `src/features/<módulo>/**` por módulo (MVVM estrito)
- Prisma schema raiz (postgres) definindo as tabelas base compartilhadas (se aplicável)
## Critério de conclusão:
- [ ] `@digimon/contracts` publicando erros/tipos/EventBus
- [ ] Renomeação `@saas` → `@digimon` completa (sem resquícios `@saas`)
- [ ] Barrel export atualizado
- [ ] Typecheck passando: `pnpm turbo typecheck`
- [ ] Lint passando
## Ao terminar: atualizar status.md, rodar `pnpm harness finish 01` e registrar handoff
## Complexidade: alta
## Baseline (git)
- context/agents/queue/01-module-tenancy.md
- context/agents/queue/02-module-authorization.md
- context/agents/queue/03-module-auth.md
- context/agents/queue/04-module-audit.md
- context/modules/audit/context.md
- context/modules/audit/status.md
- context/modules/auth/context.md
- context/modules/auth/status.md
- context/modules/authorization/context.md
- context/modules/authorization/status.md
- context/modules/tenancy/context.md
- context/modules/tenancy/status.md
- context/project/overview.md
- context/project/stack.md
- context/agents/_archived/01-module-tenancy.md
- context/agents/_archived/02-module-authorization.md
- context/agents/_archived/03-module-auth.md
- context/agents/_archived/04-module-audit.md
- context/agents/queue/01-monorepo-contracts.md
- context/agents/queue/02-module-auth-users.md
- context/agents/queue/03-module-content.md
- context/agents/queue/04-module-comments.md
- context/agents/queue/05-module-cards.md
- context/agents/queue/06-module-decks.md
- context/agents/queue/07-module-tournaments.md
- context/modules/_archived/audit/context.md
- context/modules/_archived/audit/status.md
- context/modules/_archived/auth/context.md
- context/modules/_archived/auth/status.md
- context/modules/_archived/authorization/context.md
- context/modules/_archived/authorization/status.md
- context/modules/_archived/tenancy/context.md
- context/modules/_archived/tenancy/status.md
- context/modules/cards/context.md
- context/modules/cards/status.md
- context/modules/comments/context.md
- context/modules/comments/status.md
- context/modules/content/context.md
- context/modules/content/status.md
- context/modules/contracts/context.md
- context/modules/contracts/status.md
- context/modules/decks/context.md
- context/modules/decks/status.md
- context/modules/tournaments/context.md
- context/modules/tournaments/status.md
- context/modules/users/context.md
- context/modules/users/status.md
- context/project/adr/ADR-001-portal-unico-nextjs.md
- context/project/adr/ADR-002-auth-propria-jwt.md
- context/project/adr/ADR-003-busca-fulltext-postgres.md
- context/project/adr/ADR-004-sem-multitenancy-papeis-globais.md
- context/project/adr/ADR-005-sem-redis-v1.md
- context/project/domain-model.md
