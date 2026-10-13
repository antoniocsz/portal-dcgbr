# Task: fix web — gate de editor em /admin/anuncios (consistência)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/app/admin/anuncios/page.tsx`
## Depende de: [ ] `105-frontend-admin-ads.md`
## Contexto para ler: context/modules/ads/context.md, context/modules/web/context.md, `apps/web/src/app/admin/usuarios/page.tsx` (padrão de gate)
## Skills a carregar: codegen.md + frontend.md
## Pendência (revisão do Lote 15):
Diferente de `/admin/usuarios` (que faz `redirect('/admin')` server-side para quem não é administrator), `/admin/anuncios` **não** redireciona editor — o editor que digitar a URL vê o erro 403 da listagem. Alinhar ao padrão.
## O que fazer:
1. Na página `app/admin/anuncios/page.tsx` (Server Component), aplicar o **mesmo gate** de `/admin/usuarios`: ler a sessão (`getSession` de `@/lib/session`) e, se o papel **não** for `administrator`, `redirect('/admin')`.
2. Não alterar a View/ViewModel nem o backend (o backend já revalida).
## Critério de conclusão:
- [ ] Editor/admin não-autorizado em `/admin/anuncios` → redirect `/admin` (consistente com `usuarios`)
- [ ] Administrator acessa normalmente
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 106` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/queue/106-web-admin-anuncios-gate.md
- context/agents/queue/107-api-ads-get-id-anti-bot.md
- context/agents/queue/108-web-paginas-legais-lgpd.md
- context/agents/queue/109-web-consentimento-lgpd.md
- context/agents/queue/110-lgpd-direitos-titular.md
