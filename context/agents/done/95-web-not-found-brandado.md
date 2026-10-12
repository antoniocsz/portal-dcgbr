# Task: web — página 404 customizada (brandada)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/app/not-found.tsx` (novo)
## Depende de: [ ] —
## Contexto para ler: context/modules/web/context.md, context/project/design
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pendência:
Hoje o 404 (incluindo os `notFound()` das páginas de detalhe — tasks 91/90) usa a página padrão do Next (`/_not-found`), sem a identidade do site.
## O que fazer:
1. Criar `apps/web/src/app/not-found.tsx` (Server Component, App Router): mensagem clara ("Página não encontrada" / "Este conteúdo não existe ou foi removido"), com a identidade do design system (tipografia `font-display`, tokens `text-ink`/`text-ink-soft`, `Button`/link via `@/components`).
2. Ações úteis: link para a home (`/`) e para as principais seções (Notícias, Cartas, Decks, Torneios) — ou pelo menos "Voltar para a home".
3. Deve responder **HTTP 404** (é o comportamento do `not-found.tsx` do Next) e ser indexável como noindex (padrão).
4. Não alterar `layout.tsx` nem o chrome.
## Critério de conclusão:
- [ ] `/uma-rota-qualquer` e slugs inexistentes renderizam a 404 brandada com status **404**
- [ ] Links de navegação funcionando; acessível
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 95` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/active/94-web-torneios-novo-layout.md
- context/agents/queue/95-web-not-found-brandado.md
- context/agents/queue/96-web-download-png-anchor.md
- context/agents/queue/97-backend-testes-integracao-postgres.md
- context/agents/queue/98-backend-import-assincrono.md
