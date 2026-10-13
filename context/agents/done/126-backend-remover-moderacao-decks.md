# Task: backend — remover moderação de decks da comunidade (reportes + fila admin)
## Agente: `agente-backend`
## Módulo: `packages/modules/decks` + `apps/api` + `packages/database`
## Escopo (arquivos que esta task vai tocar):
### Banco
- `packages/database/prisma/schema.prisma`
- `packages/database/prisma/migrations/<timestamp>_remove_deck_moderation/migration.sql` (novo)
- `packages/database/src/index.ts` (aprovado pelo usuário: remove o export de `CommunityDeckReport`)
- `packages/database/src/generated/**` (aprovado pelo usuário: client Prisma vendorizado/rastreado, reescrito por `prisma generate`)
### Módulo @digimon/decks
- `packages/modules/decks/src/domain/community/community-types.ts`
- `packages/modules/decks/src/domain/repositories/public-deck-repository.ts`
- `packages/modules/decks/src/domain/events/deck-events.ts`
- `packages/modules/decks/src/infra/repositories/prisma-public-deck-repository.ts`
- `packages/modules/decks/src/use-cases/community/schemas.ts`
- `packages/modules/decks/src/use-cases/community/get-community-deck.ts`
- `packages/modules/decks/src/use-cases/community/report-community-deck.ts` (remover)
- `packages/modules/decks/src/use-cases/community/list-reported-decks.ts` (remover)
- `packages/modules/decks/src/use-cases/community/open-deck-reports.ts` (remover)
- `packages/modules/decks/src/use-cases/community/dismiss-deck-reports.ts` (remover)
- `packages/modules/decks/src/use-cases/community/moderate-community-deck.ts` (remover)
- `packages/modules/decks/src/index.ts`
- `packages/modules/decks/src/use-cases/community/community.spec.ts`
- `packages/modules/decks/src/test/decks.integration.spec.ts`
### API
- `apps/api/src/routes/community-decks.ts`
- `apps/api/src/routes/community-rate-limit.ts`
- `apps/api/src/container.ts`
## Depende de: [ ] —
## Contexto para ler: context/project/domain-model.md, context/modules/decks/context.md, context/project/adr/
## Skills a carregar: codegen.md + backend.md + data.md
## Pedido do usuário:
"A postagem dos decks também não deve ter moderação." (decks são publicados direto pelo Member, sem revisão — ver overview).
## Diagnóstico:
- A moderação de decks = reportes da comunidade + fila admin (hide/restore, dismiss).
- Existe ponta a ponta: model `CommunityDeckReport` (`community_deck_reports`), use cases (`report-community-deck`, `list-reported-decks`, `open-deck-reports`, `dismiss-deck-reports`, `moderate-community-deck`), métodos de repositório (`report`, `listReports`, `queueReports`, `dismissReports`, `setStatus`), schemas (`communityModerationActionSchema`, `communityReportReasonSchema`, `reportCommunityDeckSchema`), eventos `deck.publication.reported`/`deck.publication.moderated`, rotas em `community-decks.ts`, `reportRateLimit` e wire-up no `container.ts`.
- A UI web correspondente é removida na task 127.
## Especificação (remover a feature inteira):
1. **Banco:** remover o model `CommunityDeckReport`, a relação `User.deckReports` e a relação `PublicDeck.reports` do `schema.prisma`. Criar **uma** migration que dropa a tabela `community_deck_reports` (seguir o padrão de nome `<timestamp>_remove_deck_moderation/migration.sql`, SQL no estilo das migrations existentes: `DROP TABLE "community_deck_reports";`). Rodar `prisma generate` se possível.
2. **Domínio:** remover `CommunityModerationAction`, `CommunityReportReason`, `CommunityDeckReport`, `ReportedCommunityDeck`; remover `CreatePublicDeckReportData` e os métodos `report`/`listReports`/`queueReports`/`dismissReports`/`setStatus` da interface e da impl Prisma (contadores like/unlike/addCopy permanecem). Remover o mapeamento/typo de report da impl.
3. **Use cases:** deletar os 5 arquivos; remover os schemas de report/moderação; remover os eventos `deck.publication.reported` e `deck.publication.moderated`.
4. **`get-community-deck.ts`:** remover a opção/`includeHidden` (era moderação-only) — o detalhe passa a expor apenas publicações `public`.
5. **API:** remover de `community-decks.ts` as rotas `POST /decks/community/:id/reports`, `GET/POST /admin/decks/community/...reports...` e `POST /admin/decks/community/:id/moderation`, os serializers/DTOs de report e imports que ficarem órfãos (`MANAGER_HOOK`/`requireRoleHook`, `reportRateLimit`, `isManager` se não usado). Remover `reportRateLimit` de `community-rate-limit.ts`. Remover do `container.ts` os imports e o wire-up (`report`, `moderate`, `listReported`, `openReports`, `dismissReports`).
6. **Testes:** remover os blocos de teste de reporte/moderação em `community.spec.ts` e `decks.integration.spec.ts` (e os spies/mocks correspondentes). **Decisão do usuário:** o teste "publicação oculta → ConflictError ao re-publicar" (`PublishDeckToCommunityUseCase`) deve ser **preservado**, semeando a publicação `hidden` direto no repositório in-memory (o estado `hidden` continua existindo no enum/union; só a ação de moderação sai).
## NÃO fazer:
- **Não** remover o valor `HIDDEN` do enum `PublicDeckStatus` nem a union `'hidden'` de `CommunityDeckStatus`, nem o mapeamento `STATUS_TO_PRISMA/FROM_PRISMA` — o Postgres não remove valor de enum sem recriar o tipo (risco com dados legados). Apenas a *ação* que setava hidden (moderação) sai.
- **Não** mexer em `deck-name-moderation.ts` (filtro de nome) — não é esta moderação.
## Critério de conclusão:
- [ ] Nenhuma rota/use-case/método/tipo/schema de reporte ou moderação de decks restante
- [ ] Tabela `community_deck_reports` dropada por migration; `schema.prisma` sem o model
- [ ] `pnpm turbo typecheck` passando (api + módulo)
- [ ] Testes do módulo decks passando (quando aplicável: `pnpm --filter @digimon/decks test` ou equivalente do repo)
- [ ] `pnpm harness check --db` limpo
- [ ] `git diff` restrito ao `## Escopo`
## Ao terminar: atualizar `context/modules/decks/status.md`, rodar `pnpm harness finish 126` e registrar o handoff
## Complexidade: média/alta

## Baseline (git)
- apps/web/src/features/admin/index.ts
- apps/web/src/features/admin/model/demo-data.ts
- apps/web/src/features/admin/model/types.ts
- apps/web/src/features/admin/viewmodels/use-admin-moderation-view-model.ts
- apps/web/src/features/admin/views/admin-ads-view.tsx
- apps/web/src/features/admin/views/admin-comments-view.tsx
- apps/web/src/features/admin/views/admin-dashboard-view.tsx
- apps/web/src/features/admin/views/moderation-queue.tsx
- apps/web/src/features/admin/views/site-settings-view.tsx
- context/modules/web/status.md
- context/agents/done/123-web-admin-configuracoes-padding.md
- context/agents/done/124-web-admin-remover-moderacao-comentarios-demo.md
- context/agents/done/125-web-admin-anuncios-filtros-select.md
- context/agents/queue/126-backend-remover-moderacao-decks.md
- context/agents/queue/127-web-remover-moderacao-decks.md
