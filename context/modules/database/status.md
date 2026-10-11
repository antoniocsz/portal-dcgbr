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
