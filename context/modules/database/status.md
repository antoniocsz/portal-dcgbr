# @digimon/database — Status

## Fase 1 — Centralização (Prisma 7)
- [x] Pacote `packages/database` criado (prisma.config.ts, schema, adapter-pg)
- [x] Schema movido da raiz + client gerado em `src/generated/`
- [x] Migration inicial versionada (`20260930035330_init`)
- [x] Singleton único (remoção dos duplicados em modules/web)
- [x] Refatoração dos 4 módulos (auth, users, content, comments) → `@digimon/database`
- [x] Scripts `db:*` movidos do package.json raiz
- [x] Seed do administrator inicial (executado)
- [x] docker-compose versionado (packages/database/docker-compose.yml, porta 5432)
- [x] Typecheck: ✅ 8/8
- [x] Lint: ✅ 8/8
- [x] Testes dos módulos refatorados: ✅ 4/4 (65 testes)

## Fase 2 — Refinamentos
- [ ] Migrations automatizadas no deploy (Coolify)
- [ ] Índices/full-text quando cards entrar
- [ ] Remover warnings max-len (auth-api.ts, users-api.ts, profile-view.tsx)

## Handoff
- [x] Task 08 concluída: Prisma 6→7, centralização em @digimon/database, migration + seed + docker-compose
## Fase 4 — SiteSetting (task 32)
- [x] Model `SiteSetting` (key @id, value, updatedAt) + migration 20261003_site_settings aplicada

## Handoff (task 32)
- **Feito:** tabela key/value para configurações globais do site (gate "em breve").

## Fase 5 — Bootstrap seguro (task 46)
- [x] Guard `--only-if-empty` no `prisma/seed.ts`: se `User.count() > 0`, loga
      `Seed ignorado (banco já populado)` e sai 0 (sem semear). Sem a flag, o
      comportamento idempotente por e-mail permanece.
- [x] Dois caminhos validados contra o Postgres de dev local: com flag →
      `Seed ignorado (banco já populado)` (exit 0); sem flag → skip por e-mail (exit 0).
- [x] Typecheck do pacote: ✅

## Handoff (task 46)
- **Feito:** guard `--only-if-empty` adicionado ao seed para o entrypoint da API
  (task 47) nunca sobrescrever banco real. Guarda checa `prisma.user.count() > 0`.
- **Pendências:** nenhuma. Task 47 (Dockerfile/entrypoint) consumirá a flag.

## Fase 6 — Deckbuild + comunidade de decks (task 60)
- [x] `enum CardType` ganha `DIGIEGG`; `Card.maxCountInDeck Int @default(4)`
- [x] `Deck` ganha `eggList Json @default("[]")` + `coverCardId String?` (+ `publications PublicDeck[]`)
- [x] `enum PublicDeckStatus { PUBLIC HIDDEN UNPUBLISHED }`
- [x] Tabelas `public_decks`, `public_deck_likes`, `public_deck_copies`, `community_deck_reports` (snake_case via `@@map`)
- [x] Migration `20261011120000_deckbuild_community` (ALTER enums/tabelas + CREATE TABLEs + índices + FKs)
- [x] Client regenerado em `src/generated/prisma` (`prisma generate` ✅)
- [x] Barrel `src/index.ts` atualizado (`PublicDeckStatus` + tipos `PublicDeck`/`PublicDeckLike`/`PublicDeckCopy`/`CommunityDeckReport`)
- [x] Typecheck ✅ / Lint ✅

## Handoff (task 60)
- **Feito:** schema-first para os lotes 2–7 — enriquecimento de Cards/Decks para deckbuild
  (Digi-Egg + capa + limite de cópias) e tabelas da comunidade de decks (snapshot congelado,
  likes, cópias e reportes de moderação). Migration versionada no padrão do projeto e client
  regenerado; barrel público expondo os novos tipos/enum.
- **Pendências:** nenhuma. `packages/modules/**` intocado por design; tasks 61–67 consomem o schema.
- **Decisões:** `PublicDeck` é snapshot congelado (copia nome/colors/cardList/eggList), com FK
  Cascade para o `Deck` de origem; `@@unique([accountId, sourceDeckId])` garante uma publicação
  por conta por deck; `CommunityDeckReport.reporter` usa `onDelete: SetNull` (reporte anônimo
  preservado se a conta for removida).
