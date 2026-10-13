# Task: web — consentimento de cookies (LGPD): banner + store + gate de scripts
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/consent/**` (novo)
- `apps/web/src/components/consent-banner.tsx` (novo)
- `apps/web/src/components/index.ts`
- `apps/web/src/app/layout.tsx`
## Depende de: [ ] `108-web-paginas-legais-lgpd.md`
## Contexto para ler: context/modules/web/context.md, context/project/design
## Skills carregar: codegen.md + frontend.md + ui-ux.md
## Objetivo (LGPD):
Gestão de **consentimento de cookies** no cliente: banner até o usuário decidir, preferências granulares e um hook para só carregar scripts **não-essenciais** com consentimento. Cookies **essenciais** (autenticação) são isentos e **não** dependem de consentimento.
## O que criar:
1. **Model** `features/consent/model/consent.ts`:
   - Tipo `ConsentState = { version: 1; essential: true; analytics: boolean; ads: boolean; updatedAt: string }` e categoria `ConsentCategory = 'essential' | 'analytics' | 'ads'`.
   - Store de módulo (padrão do `use-session.ts`): `getConsent()`, `setConsent(...)`, `subscribe(...)`, persistência em **`localStorage['dcgb.consent.v1']`** (com try/catch para SSR/privacidade), `hasDecided()`.
2. **ViewModel** `features/consent/viewmodels/use-consent.ts`:
   - Hook via `useSyncExternalStore` → `{ consent, hasDecided, acceptAll, rejectNonEssential, savePreferences(prefs), hasConsent(category) }`.
   - `hasConsent('essential')` sempre `true`; `analytics`/`ads` conforme decidido.
3. **View** `components/consent-banner.tsx` (client, só JSX):
   - Banner fixo (rodapé da tela) exibido **até decidir**: texto curto + botões **"Aceitar todos"**, **"Rejeitar não essenciais"** e **"Preferências"**; link para `/cookies`.
   - **Preferências**: painel/modal com toggles de `analytics` e `ads` (essenciais sempre ligados, com explicação) + "Salvar preferências".
   - Acessível (`role="dialog"`/`aria-live` conforme), sem bloquear a navegação; reserva de espaço não empurra layout de forma agressiva.
   - Após decidir, o banner some (estado no store).
4. **Integração** `app/layout.tsx`: renderizar `<ConsentBanner />` no root (uma vez).
5. **Gate de scripts**: documentar (comentário + helper exportado) que scripts não-essenciais (analytics/ads de terceiros) só devem ser carregados quando `hasConsent('analytics'|'ads')`. Hoje não há scripts de terceiros — deixar o gancho pronto.
6. **Barrel** `components/index.ts` exporta `ConsentBanner`.
## Especificação:
- MVVM estrito; sem dependências novas. Não alterar `site-header`/`site-footer` (a task 108 já põe os links legais no rodapé).
- Sem cookies de terceiros; nada de bloquear renderização do conteúdo.
## Critério de conclusão:
- [ ] Banner aparece na 1ª visita e some após decidir; preferências granulares salvam no `localStorage`
- [ ] `hasConsent` disponível para gate de scripts futuros; essenciais sempre permitidos
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 109` e registrar o handoff
## Complexidade: média

## Baseline (git)
- context/agents/active/106-web-admin-anuncios-gate.md
- context/agents/active/108-web-paginas-legais-lgpd.md
- context/agents/queue/107-api-ads-get-id-anti-bot.md
- context/agents/queue/109-web-consentimento-lgpd.md
- context/agents/queue/110-lgpd-direitos-titular.md
