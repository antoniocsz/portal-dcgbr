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