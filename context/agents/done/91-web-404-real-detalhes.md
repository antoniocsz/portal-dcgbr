# Task: web — HTTP 404 real nas páginas de detalhe (deck e torneio)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/app/(public)/decks/[slug]/page.tsx`
- `apps/web/src/app/(public)/torneios/[slug]/page.tsx`
## Depende de: [ ] `79-frontend-deck-detalhe.md`, `85-web-deck-detalhe-ssr-cookie.md`, `88-frontend-torneio-detalhe.md`
## Contexto para ler: context/modules/decks/context.md, context/modules/tournaments/context.md, ADR-007
## Skills a carregar: codegen.md + frontend.md
## Pendência:
Hoje as páginas de detalhe de **deck** e **torneio** respondem **HTTP 200** com "não encontrado" renderizado no cliente (slug inexistente). Para SEO, o servidor deveria responder **404** de verdade.
## O que fazer (nas DUAS páginas):
1. No Server Component da página, além do `generateMetadata` (que já faz o fetch SSR com o **cookie da sessão**), adicionar a checagem no corpo: buscar o recurso (`GET /decks/:slug` ou `GET /tournaments/:slug`) com o cookie; se a resposta for **404** → chamar **`notFound()`** (de `next/navigation`) → HTTP 404 real. Se ok → renderizar a View cliente como hoje.
2. Não vazar rascunho/cancelado de terceiros: sem cookie de dono, a API responde 404 → a página também responde 404 (comportamento correto).
3. Manter o `generateMetadata` funcionando (pode reusar o mesmo fetch/helper; evitar fetch duplicado desnecessário, mas a clareza > micro-otimização).
4. Não alterar as Views/ViewModels (só as páginas SSR).
## Especificação:
- Next 16 App Router; `notFound()` de `next/navigation`; `cookies()` async.
- Manter `robots` adequado no metadata.
## Critério de conclusão:
- [ ] `/decks/{slug-inexistente}` e `/torneios/{slug-inexistente}` respondem **HTTP 404** (não 200)
- [ ] Recursos existentes (públicos e rascunho/cancelado do dono) continuam 200
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 91` e registrar o handoff
## Complexidade: média

## Baseline (git)
- context/agents/active/89-web-logo-rodape-distorcao.md
- context/agents/active/90-frontend-torneio-editar.md
- context/agents/queue/91-web-404-real-detalhes.md
- context/agents/queue/92-frontend-resultados-posicao.md
