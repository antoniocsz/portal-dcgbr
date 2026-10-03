# 31 — Página de Simuladores dinâmica (posts categoria simulator) + campo externalUrl

## Agente: `agente-backend`
## Módulo: `content`

## Descrição
A página /simuladores é estática (dados fixos em use-simulators.ts). Tornar
dinâmica: listar posts published da categoria `simulator` (destaque = mais
recente; grade = demais). Links externos (Alysium/comunidade) via novo campo
`externalUrl` no Post (schema + migration + Zod + use cases + API + form).

## Escopo
- `packages/database/prisma/schema.prisma`
- `packages/database/prisma/migrations/20261003_external_url/migration.sql`
- `packages/modules/content/src/domain/entities/post.ts`
- `packages/modules/content/src/use-cases/schemas.ts`
- `packages/modules/content/src/use-cases/create-post.ts`
- `packages/modules/content/src/use-cases/update-post.ts`
- `packages/modules/content/src/infra/repositories/prisma-post-repository.ts`
- `apps/web/src/app/api/posts/_lib/serialize.ts`
- `apps/web/src/app/api/posts/simulators/route.ts`
- `apps/web/src/features/content/model/types.ts`
- `apps/web/src/features/content/model/api.ts`
- `apps/web/src/features/content/viewmodels/use-simulators.ts`
- `apps/web/src/features/content/viewmodels/use-post-form.ts`
- `apps/web/src/features/content/views/simulators-view.tsx`
- `apps/web/src/features/content/views/simulator-card.tsx`
- `apps/web/src/features/content/views/admin/post-form.tsx`
- `context/modules/content/status.md`
- `context/modules/web/status.md`

## Regras
- Migration pelo fluxo diff+psql (nunca `migrate dev`)
- Fronteira: simuladores são conteúdo editorial (categoria `simulator`), sem módulo novo
- MVVM: ViewModel useSimulators usa useQuery; Views só JSX
- Fallback de capa (gradiente) quando post não tem coverImage
- Empty state quando não há posts de simuladores publicados

## Critério de conclusão:
- [ ] Migration externalUrl aplicada (banco + arquivo)
- [ ] GET /api/posts/simulators devolve posts da categoria publicados
- [ ] Página renderiza dinâmico (destaque + grade + estados loading/erro/vazio)
- [ ] Form aceita externalUrl
- [ ] Typecheck + lint + testes ok
## Baseline (git)
- context/agents/queue/31-simuladores-dinamicos.md
