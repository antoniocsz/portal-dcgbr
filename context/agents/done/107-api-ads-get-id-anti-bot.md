# Task: api — GET /ads/admin/:id + impressões não contam para bots
## Agente: `agente-backend`
## Módulo: `apps/api`
## Escopo (arquivos que esta task vai tocar):
- `apps/api/src/routes/ads.ts`
- `apps/api/src/container.ts`
## Depende de: [ ] `103-backend-ads-routes.md`
## Contexto para ler: context/modules/ads/context.md, context/modules/ads/status.md
## Skills a carregar: codegen.md + backend.md
## Pendências (revisão do Lote 15):
1. `GetAdUseCase` existe mas **não há rota** `GET /ads/admin/:id` (use case sem uso).
2. `GET /ads` incrementa `impressions` a cada request, inclusive **bots/crawlers** — infla a métrica.
## O que fazer:
1. **Rota** `GET /ads/admin/:id` (administrator) → `AdDTO`; `404` se inexistente. Reusar o DTO/serialização existentes e o `GetAdUseCase`.
2. **Impressões anti-bot**: em `GET /ads`, **não** incrementar `impressions` quando o `User-Agent` casar com um padrão de bot/crawler (ex.: `bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|preview|headless|curl|wget|python-requests`). Manter best-effort (nunca quebrar a resposta).
   - Extrair um helper pequeno e testável (ex.: `isBotUserAgent(ua)`), com o padrão documentado.
3. Não alterar o contrato de `GET /ads?placement=` (segue `{ ads }`) nem as demais rotas admin.
## Critério de conclusão:
- [ ] `GET /ads/admin/:id` (administrator) retorna o anúncio; 404 se ausente; 401/403 sem papel
- [ ] `GET /ads` não incrementa para UA de bot (verificável no smoke com UA de bot vs UA normal)
- [ ] `pnpm turbo typecheck lint build --filter=@digimon/app-api` passando
## Ao terminar: atualizar `context/modules/ads/status.md`, rodar `pnpm harness finish 107` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- apps/web/src/app/admin/anuncios/page.tsx
- apps/web/src/app/layout.tsx
- apps/web/src/components/index.ts
- apps/web/src/components/site-footer.tsx
- apps/web/src/features/auth/views/register-view.tsx
- context/modules/web/status.md
- apps/web/src/app/(public)/cookies/page.tsx
- apps/web/src/app/(public)/privacidade/page.tsx
- apps/web/src/app/(public)/termos/page.tsx
- apps/web/src/components/consent-banner.tsx
- apps/web/src/features/consent/model/consent.ts
- apps/web/src/features/consent/viewmodels/index.ts
- apps/web/src/features/consent/viewmodels/use-consent.ts
- apps/web/src/features/legal/index.ts
- apps/web/src/features/legal/model/content.ts
- apps/web/src/features/legal/model/types.ts
- apps/web/src/features/legal/views/index.ts
- apps/web/src/features/legal/views/legal-document-view.tsx
- context/agents/done/106-web-admin-anuncios-gate.md
- context/agents/done/108-web-paginas-legais-lgpd.md
- context/agents/done/109-web-consentimento-lgpd.md
- context/agents/queue/107-api-ads-get-id-anti-bot.md
- context/agents/queue/110-lgpd-direitos-titular.md
