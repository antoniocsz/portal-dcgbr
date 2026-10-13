# Task: fix web — banner de consentimento não aparece em /admin
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/components/consent-banner.tsx`
## Depende de: [ ] `109-web-consentimento-lgpd.md`
## Contexto para ler: context/modules/web/context.md
## Skills carregar: codegen.md + frontend.md
## Pendência (revisão do Lote 16):
O `<ConsentBanner />` é montado no root layout e aparece também em `/admin*` (área interna). Deve aparecer só no site público.
## O que fazer:
1. Em `consent-banner.tsx` (já é client), usar `usePathname()` (de `next/navigation`) e **não renderizar** quando o pathname começar com `/admin` (ex.: `pathname.startsWith('/admin')`).
2. Não alterar `app/layout.tsx` (o componente continua montado no root) nem a lógica de consentimento.
## Critério de conclusão:
- [ ] Banner não aparece em `/admin/**`; continua no site público
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 112` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/active/111-web-users-tipos-locais.md
- context/agents/queue/112-web-consent-banner-fora-admin.md
- context/agents/queue/113-api-revogacao-access-token.md
- context/agents/queue/114-backend-module-privacy.md
- context/agents/queue/115-web-privacy-consent-requests.md
- context/modules/privacy/context.md
- context/modules/privacy/status.md
