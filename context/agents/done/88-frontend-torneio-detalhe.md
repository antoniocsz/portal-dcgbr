# Task: frontend — página de detalhamento do torneio (`/torneios/[slug]`) + resultados
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/app/(public)/torneios/[slug]/page.tsx` (novo)
- `apps/web/src/features/tournaments/views/tournament-detail-view.tsx` (novo)
- `apps/web/src/features/tournaments/views/tournament-results-form.tsx` (novo)
- `apps/web/src/features/tournaments/views/index.ts`
- `apps/web/src/features/tournaments/viewmodels/use-tournament.ts`
- `apps/web/src/features/tournaments/viewmodels/index.ts`
## Depende de: [ ] —
## Contexto para ler: context/modules/tournaments/context.md, context/modules/tournaments/status.md, context/modules/web/context.md, context/project/design
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Problema / pedido:
"Não tem o detalhamento dos torneios." A lista (`tournaments-list-view.tsx`) linka para `/torneios/{slug}`, que **não existe (404)**. Já existem: o ViewModel `useTournament(slug)`, os helpers (`tournament-view.ts`), as ações (`use-tournament-actions.ts`: cancelar + registrar resultados) e a API (`GET/PATCH/DELETE /tournaments/:slug`, `POST /tournaments/:slug/results`). Falta a **página + View**. Nenhuma UI registra **resultados** hoje.
## O que criar:
1. **Rota** `apps/web/src/app/(public)/torneios/[slug]/page.tsx` (Client View hidratada; `generateMetadata` por slug — opcional, com fetch SSR; sem vazar cancelado de terceiros). Renderiza `<TournamentDetailView slug={slug} />`.
2. **View `tournament-detail-view.tsx`** (só JSX; dados/callbacks do VM):
   - Cabeçalho: nome, `StatusBadge` (published/finished/cancelled), formato, **local** (`location`), **datas** (início/fim via `formatTournamentDate`), descrição.
   - **Seções de informação**: formato, local, data de início, data de término (quando houver), organizador (nome só quando o visitante é o organizador — não há `GET /users/:id` público; senão omitir).
   - **Resultados/classificação** (`results: { position, player, deck, record }[]`): tabela/lista ordenada por `position` (posição, jogador, deck, record) quando `results` existir (torneio `finished`); estado vazio claro quando não houver.
   - **Ações por papel** (usar `useSession` para saber se é organizador/Admin/Editor e o dono):
     - Organizador/Admin/Editor: **Registrar/editar resultados** (abre o form) e **Cancelar torneio** (com confirmação). (Editar dados do torneio fica para uma task própria — não linkar para rota inexistente.)
     - Visitante: sem ações destrutivas.
   - Estados loading/erro/**404** ("Torneio não encontrado"), sem vazar cancelado de terceiros.
   - Voltar para `/torneios`.
3. **Form `tournament-results-form.tsx`** (só JSX): linhas dinâmicas de resultado (`position`, `player`, `deck?`, `record?`), adicionar/remover linha, válido quando ≥1 linha com `position`/`player`; usa `useAddResults` (View/VM). Feedback de sucesso/erro.
4. **`use-tournament.ts`**: enriquecer o VM com o que a View precisa — detecção de organizador/Admin/Editor, `isNotFound` (404 sem vazar), ações (cancelar/registrar resultados) reusando `use-tournament-actions.ts`, e invalidação da query do torneio + listagem após sucesso.
5. **Barrel** `views/index.ts` (+ `viewmodels/index.ts` se novo símbolo).
## Especificação:
- MVVM estrito: View só JSX; fetch/mutations só em Model/ViewModel. Não importar `@digimon/tournaments` no client.
- `GET /tournaments/:slug` público (published/finished); cancelado só criador/Admin/Editor.
- Consumir as **rotas reais** (`/tournaments/:slug`, `/tournaments/:slug/results`).
## Critério de conclusão:
- [ ] `/torneios/{slug}` abre o detalhe (fim do 404) com formato/local/datas/descrição e **resultados** quando houver
- [ ] Organizador/Admin consegue **registrar resultados** (form) e **cancelar**; visitante não vê ações destrutivas
- [ ] 404 claro para torneio inexistente/cancelado de terceiros
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md` e `context/modules/tournaments/status.md`, rodar `pnpm harness finish 88` e registrar o handoff
## Complexidade: alta

## Baseline (git)
- context/agents/queue/88-frontend-torneio-detalhe.md
