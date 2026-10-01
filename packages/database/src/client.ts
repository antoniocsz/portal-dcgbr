// Path: packages/database/src/client.ts
// Singleton do PrismaClient — ÚNICO lugar do monorepo onde o client é
// instanciado (Prisma 7: driver adapter @prisma/adapter-pg).
// Módulos e apps importam `prisma` via barrel @digimon/database.

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client'

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://digimon:digimon@localhost:5432/digimon'

const adapter = new PrismaPg({ connectionString })

const globalForPrisma = globalThis as unknown as { digimonPrisma?: PrismaClient }

export const prisma: PrismaClient = globalForPrisma.digimonPrisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.digimonPrisma = prisma
