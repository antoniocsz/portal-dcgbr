# Task: frontend — gate server-side das rotas de membro (`(member)`)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/app/(member)/layout.tsx`
- `apps/web/src/lib/session.ts`
## Depende de: [ ] —
## Contexto para ler: context/modules/web/context.md, context/project/adr/ADR-007*, `.agents/frontend.md`
## Skills a carregar: codegen.md + frontend.md
## Problema (pendência do Lote 9):
As rotas do grupo `(member)` (`/decks/novo`, `/decks/[slug]/editar`, `/perfil`, `/torneios/novo`) **não têm gate server-side**: `(member)/layout.tsx` é passthrough e `proxy.ts` só trata o modo "em breve". Hoje a única proteção é o 401 da API. Usuário anônimo consegue abrir a página (e ver o form).
## O que fazer:
1. **`(member)/layout.tsx`** vira **Server Component** que lê a sessão (`getSession()` de `@/lib/session`) e, se **não autenticado**, `redirect('/login')` (opcionalmente com `?next=<path>`). Se o proxy/`headers()` permitir o path, incluir `next`; senão, redirecionar para `/login` simples.
2. **`lib/session.ts`**: garantir um `getSession()` server-only reutilizável (valida o cookie de access token). Já existe para o admin — reusar/ajustar (não duplicar).
3. Não alterar as páginas individuais; o gate é do grupo. Não mudar o comportamento do `proxy.ts` (site-gate) além do necessário.
## Especificação:
- Next 16 App Router; `redirect` de `next/navigation`; sem fetch/estado no layout além da leitura de sessão.
- Rotas públicas (`(public)`) e de auth (`(auth)`) **não** mudam.
## Critério de conclusão:
- [ ] Anônimo em `/decks/novo`, `/perfil`, `/decks/{slug}/editar`, `/torneios/novo` → redireciona para `/login`
- [ ] Usuário logado acessa normalmente
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 81` e registrar o handoff
## Complexidade: média

## Baseline (git)
- apps/web/next-env.d.ts
- context/agents/active/76-frontend-cartas-filtros-selects.md
- context/agents/active/77-frontend-hovercard-carta.md
- context/agents/queue/78-frontend-busca-cartas-deck.md
- context/agents/queue/79-frontend-deck-detalhe.md
- context/agents/queue/80-frontend-deck-editar.md
- context/agents/queue/81-frontend-gate-member.md
- context/agents/queue/82-cards-filtro-custo-faixa.md
- context/agents/queue/83-web-next-image-setscount.md
