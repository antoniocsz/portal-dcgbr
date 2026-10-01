// Path: packages/database/prisma.config.ts
// Config do Prisma 7 (substitui a config antiga via package.json/root).
// O CLI (generate/migrate/studio) lê esta config; o runtime usa o driver adapter
// (@prisma/adapter-pg) com a mesma DATABASE_URL — ver src/client.ts.

import { config } from 'dotenv'
import path from 'node:path'
import { defineConfig } from 'prisma/config'

// Carrega o .env do pacote e o .env da raiz do monorepo (nesta ordem).
// O CLI roda a partir de packages/database, então ../../.env é a raiz.
config({ path: path.resolve(process.cwd(), '.env') })
config({ path: path.resolve(process.cwd(), '../../.env') })

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts'
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://digimon:digimon@localhost:5432/digimon',
    shadowDatabaseUrl:
      process.env.SHADOW_DATABASE_URL ?? 'postgresql://digimon:digimon@localhost:5433/digimon_shadow'
  }
})
