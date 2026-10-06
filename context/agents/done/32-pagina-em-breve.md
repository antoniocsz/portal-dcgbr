# 32 — Página "Em breve" configurável no painel admin

## Agente: `agente-backend`
## Módulo: `web`

## Descrição
Página "em breve" (coming-soon) ativável/desativável pelo administrator no
painel. Quando ativa, todo o site público (exceto /admin, /api, /login,
/registro e /em-breve) redireciona para /em-breve. Implementação: model
`SiteSetting` (key/value) no banco + proxy do Next 16 (proxy.ts — convenção que
substituiu middleware.ts, runtime Node) com cache in-process (globalThis + TTL)
+ página /em-breve (noindex) + página /admin/configuracoes com seletor.

## Escopo
- `packages/database/prisma/schema.prisma`
- `packages/database/prisma/migrations/20261003_site_settings/migration.sql`
- `apps/web/src/lib/server/site-gate.ts`
- `apps/web/src/proxy.ts`
- `apps/web/src/app/em-breve/page.tsx`
- `apps/web/src/app/api/settings/site-gate/route.ts`
- `apps/web/src/app/admin/configuracoes/page.tsx`
- `apps/web/src/components/site-chrome.tsx`
- `apps/web/src/features/admin/model/site-gate-api.ts`
- `apps/web/src/features/admin/viewmodels/use-site-gate.ts`
- `apps/web/src/features/admin/views/site-settings-view.tsx`
- `apps/web/src/features/admin/views/admin-shell.tsx`
- `apps/web/src/features/admin/index.ts`
- `context/modules/web/status.md`
- `context/modules/database/status.md`

## Regras
- Migration pelo fluxo diff+psql (nunca `migrate dev`)
- Proxy (Next 16): sempre roda em Node — sem segment config `runtime`; allowlist /admin,/api,/login,/registro,/em-breve e assets (matcher exclui arquivos)
- Gate cache: in-process (globalThis) com TTL curto; PATCH limpa o cache na hora
- Somente `administrator` pode alterar (requireRole no route handler + página)
- Página /em-breve com robots noindex; sem chrome (header/footer)
- MVVM no frontend (ViewModel + View sem dados diretos)

## Critério de conclusão:
- [ ] Migration site_settings aplicada
- [ ] GET/PATCH /api/settings/site-gate (guard admin)
- [ ] Middleware redireciona público no modo coming-soon; /admin e /api seguem livres
- [ ] Página /admin/configuracoes com toggle funcional
- [ ] Typecheck + lint + E2E ok
## Baseline (git)
- context/agents/queue/32-pagina-em-breve.md
