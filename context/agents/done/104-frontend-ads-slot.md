# Task: frontend — feature ads + `<AdSlot>` + posições no site
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/ads/**`
- `apps/web/src/components/ad-slot.tsx` (novo)
- `apps/web/src/components/index.ts`
- `apps/web/src/features/content/views/home-view.tsx`
- `apps/web/src/features/content/views/post-article.tsx`
- `apps/web/src/features/cards/views/cards-view.tsx`
## Depende de: [ ] `103-backend-ads-routes.md`
## Contexto para ler: context/modules/ads/context.md, context/modules/web/context.md, context/project/design
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## O que criar (MVVM estrito):
1. **Model** (`features/ads/model/`): tipos (`Ad`, `AdKind`, `AdPlacement`) espelhando o `AdDTO`; `ads-api.ts` (`listByPlacement(placement, limit?)`, `trackClick(id)`).
2. **ViewModel** `use-ads.ts` (ou `use-ad-slot.ts`): busca os anúncios do placement (React Query), escolhe 1 (rotação) para slots de item único, expõe `{ ad, isLoading, trackClick }`.
3. **View** `apps/web/src/components/ad-slot.tsx` (design system, export no barrel):
   - `<AdSlot placement="home-top" />` — renderiza 1 anúncio (ou `count` para in-feed). **Reserva a altura** (evita CLS); não renderiza nada quando não há anúncio.
   - Criativo: imagem com **`<img>` nativo** (ou `next/image` com `unoptimized`) — o host do criativo é **dinâmico** (CDN próprio do e-commerce / links da Amazon), então **NÃO** dependa de `remotePatterns` do `next.config.ts`. Sem imagem → card textual (título + subtítulo + CTA).
   - Link para `targetUrl` com `target="_blank"`/`rel="noopener"`; para `kind` **affiliate/sponsor**, usar **`rel="sponsored nofollow noopener"`** e exibir rótulo de divulgação ("Publicidade"/"Parceiro") quando `disclosure` ou kind≠house.
   - `onClick` dispara `trackClick(ad.id)` (fire-and-forget, sem bloquear a navegação).
   - Acessibilidade: `alt`/`aria-label`; não usar `aria-hidden` no criativo.
4. **Posições** (inserir `<AdSlot>`):
   - `home-view.tsx`: `home-top` (abaixo do hero) e `home-infeed` (depois das últimas notícias).
   - `post-article.tsx`: `article-inline` (dentro/após o corpo).
   - `cards-view.tsx`: `cards-top` (topo da listagem).
5. **Barrel** `components/index.ts` exporta `AdSlot`.
## Especificação:
- Não importar `@digimon/ads` no client (tipos literais em sync).
- Sem scripts de terceiros (house/afiliado) — nada de cookies.
- Se o host das imagens de criativo for configurável, documentar (o admin pode usar um CDN próprio); se necessário, estender `next.config.ts` `remotePatterns` — **mas** `next.config.ts` está fora deste escopo: se precisar, reporte.
## Critério de conclusão:
- [ ] `<AdSlot>` renderiza anúncios do placement (ou nada), com `rel` correto p/ afiliado e rótulo de divulgação
- [ ] Slots inseridos nas 3 páginas; sem CLS perceptível
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md` e `context/modules/ads/status.md`, rodar `pnpm harness finish 104` e registrar o handoff
## Complexidade: média

## Baseline (git)
- apps/api/package.json
- apps/api/src/container.ts
- apps/api/src/routes/index.ts
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
- context/agents/done/102-backend-module-ads.md
- context/agents/done/103-backend-ads-routes.md
- context/agents/queue/104-frontend-ads-slot.md
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
