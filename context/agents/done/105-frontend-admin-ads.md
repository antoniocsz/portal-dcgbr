# Task: frontend admin — CRUD de anúncios (house, patrocínio, afiliado)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/admin/model/ads-admin-api.ts` (novo)
- `apps/web/src/features/admin/viewmodels/use-admin-ads.ts` (novo)
- `apps/web/src/features/admin/views/admin-ads-view.tsx` (novo)
- `apps/web/src/features/admin/index.ts`
- `apps/web/src/app/admin/anuncios/page.tsx` (novo)
- `apps/web/src/features/admin/views/admin-shell.tsx` (escopo estendido: item de navegação "Anúncios", conforme o passo 4 da task)
## Depende de: [ ] `104-frontend-ads-slot.md`
## Contexto para ler: context/modules/ads/context.md, context/modules/web/context.md, context/modules/admin (padrão)
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## O que criar (MVVM estrito):
1. **Model** `ads-admin-api.ts`: client das rotas admin (`GET/POST /ads/admin`, `PATCH/DELETE /ads/admin/:id`); tipos literais.
2. **ViewModel** `use-admin-ads.ts`: lista (filtros placement/kind/isActive), criar/editar/remover (mutações + invalidação).
3. **View** `admin-ads-view.tsx` (só JSX): tabela de anúncios (título, tipo, placements, ativo, janela, impressões/cliques) + **formulário** (criar/editar) com campos: título, subtítulo, imagem (URL), **link de destino** (destacando que afiliado/patrocínio leva `rel=sponsored`), tipo (house/affiliate/sponsor), placements (multi-seleção: home-top, home-infeed, cards-top, article-inline), CTA, nome do patrocinador, rótulo de divulgação, ativo, prioridade, janela (startAt/endAt), abrir em nova aba.
   - Ações: ativar/desativar, editar, excluir (com confirmação). Estados loading/erro/vazio.
   - Dicas de UX: para `affiliate`, sugerir o link de afiliado da Amazon; para `house`, o link do e-commerce próprio.
4. **Página** `app/admin/anuncios/page.tsx` (administrator) usando o AdminShell; adicionar item **"Anúncios"** na navegação do `admin-shell.tsx` (gate de role).
5. **Barrel** `features/admin/index.ts` atualizado.
## Especificação:
- Não importar `@digimon/ads` no client.
- Apenas `administrator` gerencia (backend revalida).
## Critério de conclusão:
- [ ] `/admin/anuncios` lista e faz CRUD via rotas reais; item na sidebar
- [ ] Form cobre todos os campos (incl. placements e tipo) e a janela de datas
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md` e `context/modules/ads/status.md`, rodar `pnpm harness finish 105` e registrar o handoff
## Complexidade: alta

## Baseline (git)
- apps/api/package.json
- apps/api/src/container.ts
- apps/api/src/routes/index.ts
- apps/web/src/components/index.ts
- apps/web/src/features/cards/views/cards-view.tsx
- apps/web/src/features/content/views/home-view.tsx
- apps/web/src/features/content/views/post-article.tsx
- context/modules/web/status.md
- packages/database/prisma/schema.prisma
- packages/database/src/generated/prisma/browser.ts
- packages/database/src/generated/prisma/client.ts
- packages/database/src/generated/prisma/commonInputTypes.ts
- packages/database/src/generated/prisma/enums.ts
- packages/database/src/generated/prisma/internal/class.ts
- packages/database/src/generated/prisma/internal/prismaNamespace.ts
- packages/database/src/generated/prisma/internal/prismaNamespaceBrowser.ts
- packages/database/src/generated/prisma/models.ts
- packages/database/src/generated/prisma/models/User.ts
- packages/database/src/index.ts
- pnpm-lock.yaml
- apps/api/src/routes/ads.ts
- apps/web/src/components/ad-slot.tsx
- apps/web/src/features/ads/model/ads-api.ts
- apps/web/src/features/ads/model/types.ts
- apps/web/src/features/ads/viewmodels/index.ts
- apps/web/src/features/ads/viewmodels/use-ads.ts
- context/agents/done/102-backend-module-ads.md
- context/agents/done/103-backend-ads-routes.md
- context/agents/done/104-frontend-ads-slot.md
- context/agents/queue/105-frontend-admin-ads.md
- context/modules/ads/context.md
- context/modules/ads/status.md
- packages/database/prisma/migrations/20261012120000_ads/migration.sql
- packages/database/src/generated/prisma/models/Ad.ts
- packages/modules/ads/package.json
- packages/modules/ads/src/domain/actor.ts
- packages/modules/ads/src/domain/entities/ad.spec.ts
- packages/modules/ads/src/domain/entities/ad.ts
- packages/modules/ads/src/domain/events/ad-events.ts
- packages/modules/ads/src/domain/repositories/ad-repository.ts
- packages/modules/ads/src/index.ts
- packages/modules/ads/src/infra/repositories/prisma-ad-repository.ts
- packages/modules/ads/src/test/memory-ad-repository.ts
- packages/modules/ads/src/use-cases/ads.spec.ts
- packages/modules/ads/src/use-cases/create-ad.ts
- packages/modules/ads/src/use-cases/delete-ad.ts
- packages/modules/ads/src/use-cases/get-ad.ts
- packages/modules/ads/src/use-cases/list-ads.ts
- packages/modules/ads/src/use-cases/schemas.ts
- packages/modules/ads/src/use-cases/track-ad-click.ts
- packages/modules/ads/src/use-cases/update-ad.ts
- packages/modules/ads/tsconfig.json
- packages/modules/ads/vitest.config.ts
