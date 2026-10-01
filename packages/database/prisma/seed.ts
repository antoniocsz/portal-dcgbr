// Path: packages/database/prisma/seed.ts
// Seed: cria o administrator inicial (email/senha via env) se não existir.
// Hash no mesmo formato do ScryptPasswordHasher (@digimon/auth):
// `scrypt$<salt hex 16B>$<hash hex 64B>` (node:crypto, sem dep externa).

import { randomBytes, scryptSync } from 'node:crypto'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://digimon:digimon@localhost:5432/digimon'

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const KEY_LENGTH = 64
const SALT_LENGTH = 16

function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH)
  const derived = scryptSync(password, salt, KEY_LENGTH)
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`
}

async function main(): Promise<void> {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@digimoncardgamebrasil.com.br').toLowerCase()
  const password = process.env.ADMIN_PASSWORD ?? 'admin12345'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`Seeding skipped: administrator ${email} já existe (id=${existing.id})`)
    return
  }

  await prisma.user.create({
    data: {
      email,
      name: 'Administrator',
      passwordHash: hashPassword(password),
      role: 'ADMINISTRATOR',
      emailVerifiedAt: new Date()
    }
  })
  console.log(`Seeding ok: administrator ${email} criado (senha padrão de dev — defina ADMIN_PASSWORD em produção)`)
}

main()
  .catch((error: unknown) => {
    console.error('Seed falhou:', error)
    process.exitCode = 1
  })
  .finally(() => {
    void prisma.$disconnect()
  })