# Task: web — perfil do membro com dados reais (métricas e abas)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/users/model/profile-activity-api.ts` (novo)
- `apps/web/src/features/users/model/types.ts`
- `apps/web/src/features/users/viewmodel/use-profile-activity.ts` (novo)
- `apps/web/src/features/users/views/profile-view.tsx`
- `apps/web/src/features/comments/model/comments-api.ts`
## Depende de: [ ] — contrato de `GET /comments?mine=true` (task 130) já congelado: mesmo shape de `/comments` (`{ items, total, page, pageSize }`)
## Contexto para ler: context/modules/web/context.md, context/modules/users/context.md
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pedido do usuário:
"A tela de perfil tem dados mockados? Quero os dados reais."
## Diagnóstico (mock atual em `profile-view.tsx`):
- `STATS` (Posts 12 · Decks 8 · Torneios 5 · Comentários 147) — hardcoded.
- `DECKS` (Royal Knights / Greymon Rush / Leopardmon) — hardcoded.
- Abas "Torneios" e "Comentários" — placeholder.
- Identidade (nome/papel/createdAt/avatar) já é real via `GET /users/me` — manter.
## Especificação (remover todo mock; dados reais):
1. `comments-api.ts`: adicionar `listMyComments(params: { page?; pageSize? })` chamando `GET /comments?mine=true` (mesmo shape de `ListCommentsResult`).
2. Novo `model/profile-activity-api.ts`: reúne a atividade do titular reaproveitando o que já existe — `decksApi.listDecks({ mine: true })`, `tournamentsApi.listTournaments({ mine: true })`, `listMyComments(...)` e `communityDecksApi.listPublications()` — retornando `{ stats, decks, tournaments, comments, publications }`. Sem hooks/JSX (Model).
3. Novo `viewmodels/use-profile-activity.ts` (MVVM): busca os dados reais e expõe `stats`, `decks`, `tournaments`, `comments`, `isLoading`, `error`.
4. `profile-view.tsx`:
   - Métricas reais (4): **Decks · Torneios · Comentários · Publicações** (usar os `total` das listas e `publications.length`); remover a constante `STATS`.
   - Aba **Decks**: listar os decks reais do titular (nome, formato, status; link para `/decks/[slug]`); remover a constante `DECKS` e as capas em gradiente mockadas.
   - Aba **Torneios**: listar os torneios reais (nome, data, local, status; link para `/torneios/[slug]`).
   - Aba **Comentários**: listar os comentários reais do titular (corpo, alvo, data).
   - Manter estados de loading/erro/vazio (mensagem "Nada por aqui ainda" quando a lista estiver vazia).
   - **Remover** o botão morto "Ver decks" (sem ação).
5. Manter a identidade e a seção de privacidade como estão; sem mudança de comportamento fora do perfil.
## Critério de conclusão:
- [ ] Nenhum dado mockado no perfil (`STATS`/`DECKS` removidos)
- [ ] Métricas e as 3 abas alimentadas por dados reais da API
- [ ] MVVM estrito (View sem fetch; tudo via ViewModel)
- [ ] `pnpm turbo typecheck --filter=@digimon/app-web` passando
- [ ] `git diff` restrito ao `## Escopo`
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 131` e registrar o handoff
## Complexidade: média

## Baseline (git)
- context/agents/active/130-backend-comments-meus-comentarios.md
- context/agents/queue/131-web-perfil-dados-reais.md
