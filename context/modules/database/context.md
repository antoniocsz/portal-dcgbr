# @digimon/database — Contexto do Módulo

## Responsabilidade
Dono único do Prisma/Postgres no monorepo: schema, client gerado, migrations e seed. Centraliza o singleton `PrismaClient` (driver adapter) e expõe tudo via barrel público. Nenhum outro pacote importa `@prisma/client` diretamente.

## Entidades
- Schema único em `prisma/schema.prisma` (tabelas base: User, RefreshToken, PasswordResetToken, Post, Comment + enums globais)
- Client gerado localmente em `src/generated/` (generator `prisma-client`, Prisma 7)
- Migrations versionadas em `prisma/migrations/`
- Seed em `prisma/seed.ts` (administrator inicial)

## Use Cases
- Nenhum (módulo de infraestrutura/dados)

## Eventos que Publica
- N/A

## Eventos que Consome
- N/A

## Dependências
- `@prisma/client` (runtime do client gerado), `@prisma/adapter-pg`, `prisma` (CLI, dev)
- Config via `prisma.config.ts` (padrão Prisma 7)

## Repositórios
- N/A (expõe o client; repositórios vivem nos módulos de domínio)

## Regras
- **Único lugar do monorepo com `@prisma/client` importado**
- Singleton único: `src/client.ts` exporta a instância (adapter-pg + DATABASE_URL)
- Fronteira de módulo: demais pacotes importam `@digimon/database` (barrel), nunca `@prisma/client`
- Scripts de banco (`db:generate`, `db:migrate`, `db:deploy`, `db:seed`) vivem neste pacote