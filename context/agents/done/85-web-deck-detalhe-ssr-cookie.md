# Task: web — detalhe do deck: metadata SSR com a sessão (rascunho do dono)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/app/(public)/decks/[slug]/page.tsx`
## Depende de: [ ] `79-frontend-deck-detalhe.md`
## Contexto para ler: context/modules/decks/context.md, context/modules/web/context.md, ADR-007
## Skills a carregar: codegen.md + frontend.md
## Problema (pendência da revisão do Lote 10):
O `generateMetadata` do detalhe do deck faz um `fetch` SSR para `GET /decks/:slug` **sem encaminhar o cookie de sessão**. Como o `GET /decks/:slug` retorna 404 para rascunho de outro usuário, o **dono abrindo o próprio rascunho** recebe o título "Deck não encontrado" (o conteúdo client carrega normal, pois `apiClient` envia credentials). Apenas o título/SEO do rascunho é afetado.
## O que fazer:
1. No `page.tsx`, ler os **cookies da request** (`cookies()` de `next/headers`, Server Component) e **encaminhar o cookie de sessão** no `fetch` SSR para a API (header `cookie`), de modo que o dono do rascunho receba `200` e o metadata correto (nome do deck).
2. Garantir que o fetch continue resiliente (falha → metadata genérica, sem quebrar a página).
3. Não vazar dados: para não-dono/visitante o comportamento continua (404 → metadata "não encontrado").
4. Manter `robots: { index: false }` para rascunhos, se aplicável.
## Especificação:
- Next 16 App Router; `cookies()` é async em versões recentes — usar `await cookies()`.
- Não alterar o ViewModel nem a View (só a página SSR).
## Critério de conclusão:
- [ ] Dono abrindo `/decks/{slug}` de um rascunho vê o **título correto** (não "não encontrado")
- [ ] Visitante continua sem ver rascunhos (404)
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 85` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/active/84-decks-detalhe-thumb-e-export-png.md
- context/agents/queue/85-web-deck-detalhe-ssr-cookie.md
- context/agents/queue/86-web-deck-editar-gate-dono.md
- context/agents/queue/87-cards-filtros-tipagem.md
