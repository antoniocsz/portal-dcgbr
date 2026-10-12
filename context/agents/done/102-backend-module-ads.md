# Task: módulo @digimon/ads (anúncios: house, patrocínio e afiliado) + schema
## Agente: `agente-backend`
## Módulo: `packages/modules/ads`
## Escopo (arquivos que esta task vai tocar):
- `packages/modules/ads/**`
- `packages/database/prisma/**`
- `packages/database/src/**`
- `context/modules/ads/**`
## Depende de: [ ] —
## Contexto para ler: context/modules/ads/context.md, context/modules/ads/status.md, context/modules/content/context.md (padrão de módulo)
## Skills a carregar: codegen.md + backend.md + data.md
## Objetivo:
Criar o bounded context de anúncios/patrocínio, seguindo o padrão dos demais módulos (`@digimon/content`, `@digimon/decks`). Suporta **house ads** (e-commerce próprio), **patrocínio direto** e **links de afiliado** (Amazon).
## O que criar:
1. **Domínio**:
   - `domain/entities/ad.ts` — `Ad` com invariantes: `targetUrl` http(s), `placements.length >= 1`, `title` não vazio, `priority >= 0`; helpers `isVisibleAt(date)` (isActive + janela startAt/endAt).
   - `AdKind = 'house' | 'affiliate' | 'sponsor'`.
   - `domain/repositories/ad-repository.ts` — `AdRepository` (DIP): `create`, `update`, `delete`, `findById`, `list(filter)`, `activeForPlacement(placement, now)`, `incrementImpressions(ids)`, `incrementClicks(id)`.
   - `domain/events/ad-events.ts` — `ad.created`, `ad.updated`, `ad.deleted`.
   - `domain/actor.ts` — curadoria (administrator), no padrão do projeto.
2. **Use cases** (`use-cases/*.ts` + `schemas.ts` Zod):
   - `ListAdsUseCase` (admin: filtros `placement`/`kind`/`isActive`; **público**: ativos por `placement`, dentro da janela, ordenados por `priority` desc; com rotação — pode devolver até N candidatos).
   - `GetAdUseCase`, `CreateAdUseCase`, `UpdateAdUseCase`, `DeleteAdUseCase` (curadoria; eventos).
   - `TrackAdClickUseCase` (incrementa `clicks`).
   - (impressões: o repo expõe `incrementImpressions` — chamado pela rota pública de forma best-effort.)
3. **Infra**: `infra/repositories/prisma-ad-repository.ts` (Prisma; `placements` é lista escalar).
4. **Barrel** `src/index.ts` (só público).
5. **Schema Prisma** (`packages/database/prisma/schema.prisma`): `enum AdKind { HOUSE AFFILIATE SPONSOR }` + `model Ad` (`@@map("ads")`, `placements String[]`, índices `[isActive]`, `[kind]`) + migration `packages/database/prisma/migrations/<ts>_ads/migration.sql` (padrão das migrations existentes). Regenerar o client (`prisma generate`). Atualizar `packages/database/src/index.ts` (exportar `Ad`/`AdKind` se o padrão exporta modelos).
6. **Testes** unitários com repo em memória (`src/test/memory-ad-repository.ts`): invariantes, janela de datas, filtro por placement, rotação por peso, click incrementa, curadoria exige administrator.
7. **Docs**: preencher `context/modules/ads/status.md` (fases/handoff).
## Especificação:
- Não tocar em `apps/api`/`apps/web` (rotas e UI são as tasks 103/104).
- Ids `cuid()`; sem PII nos contadores.
## Critério de conclusão:
- [ ] Módulo com domínio/use cases/repo Prisma/barrel; invariantes testadas
- [ ] Schema + migration aplicáveis; client regenerado
- [ ] `pnpm turbo typecheck lint test --filter=@digimon/ads --filter=@digimon/database` passando
- [ ] Barrel atualizado
## Ao terminar: atualizar `context/modules/ads/status.md`, rodar `pnpm harness finish 102` e registrar o handoff
## Complexidade: alta

## Baseline (git)
- context/agents/queue/102-backend-module-ads.md
- context/agents/queue/103-backend-ads-routes.md
- context/agents/queue/104-frontend-ads-slot.md
- context/agents/queue/105-frontend-admin-ads.md
- context/modules/ads/context.md
- context/modules/ads/status.md
