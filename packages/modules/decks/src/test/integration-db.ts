// Path: packages/modules/decks/src/test/integration-db.ts
// Infra dos testes de INTEGRAÇÃO do @digimon/decks contra um Postgres real.
//
// Gated por TEST_DATABASE_URL: sem a variável, os specs que importam este helper
// usam `describe.skipIf(!hasTestDatabase)` e são PULADOS — o CI sem banco segue
// verde. A URL DEVE apontar para um banco exclusivo de teste (schema migrado com
// `prisma migrate deploy`), NUNCA para o banco de dev (`digimon`).
//
// Execução local:
//   psql -c 'CREATE DATABASE digimon_test' (ou docker exec)
//   DATABASE_URL=postgresql://digimon:digimon@localhost:5432/digimon_test \
//     pnpm --filter @digimon/database exec prisma migrate deploy
//   TEST_DATABASE_URL=postgresql://digimon:digimon@localhost:5432/digimon_test \
//     pnpm --filter @digimon/decks test
//
// NOTA (Turbo env strict): NÃO use `pnpm turbo test --filter=@digimon/decks`.
// No Turbo 2.11.5 o `envMode` é "strict" por default e TEST_DATABASE_URL não está
// declarada (env/passThroughEnv) no turbo.json — a variável é FILTRADA do
// ambiente das tasks, `hasTestDatabase` fica falso e a suíte é PULADA em silêncio.
// Rode o pacote direto (acima) ou, se precisar do Turbo, force `--env-mode=loose`.
import { createRequire } from 'node:module'
import { PrismaClient } from '@digimon/database'

/** URL do Postgres de teste (ausente ⇒ a suíte de integração é pulada). */
export const testDatabaseUrl = process.env.TEST_DATABASE_URL

/** `true` quando há um banco de teste configurado. */
export const hasTestDatabase = (testDatabaseUrl ?? '').length > 0

// O driver adapter (Prisma 7) é dependência do @digimon/database, não deste
// módulo. Resolvê-lo a partir do próprio @digimon/database reaproveita o padrão
// de `packages/database/src/client.ts` sem declará-lo no package.json (test-only).
const requireFromDatabase = createRequire(
  createRequire(import.meta.url).resolve('@digimon/database')
)
const { PrismaPg } = requireFromDatabase('@prisma/adapter-pg') as {
  PrismaPg: new (options: { connectionString: string }) => never
}

/** PrismaClient apontando para TEST_DATABASE_URL (adapter-pg, como o client do banco). */
export function createTestPrisma(): PrismaClient {
  if (!testDatabaseUrl) throw new Error('TEST_DATABASE_URL não está definida')
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: testDatabaseUrl }) })
}

/** Trunca as tabelas usadas pelo spec — limpeza determinística entre testes. */
export async function truncateTables(
  prisma: PrismaClient,
  tables: string[]
): Promise<void> {
  const list = tables.map((table) => `"${table}"`).join(', ')
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`)
}
