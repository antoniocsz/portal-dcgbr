-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('DIGIMON', 'OPTION', 'TAMER');

-- CreateEnum
CREATE TYPE "CardColor" AS ENUM ('RED', 'BLUE', 'YELLOW', 'GREEN', 'PURPLE', 'BLACK', 'WHITE');

-- CreateTable
CREATE TABLE "card_sets" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "dcgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "type" "CardType" NOT NULL,
    "colors" "CardColor"[],
    "level" INTEGER,
    "digiType" TEXT,
    "attribute" TEXT,
    "dp" INTEGER,
    "playCost" INTEGER,
    "evolutionConditions" JSONB NOT NULL DEFAULT '[]',
    "effects" TEXT,
    "imageUrl" TEXT,
    "setCode" TEXT,
    "releaseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "card_sets_code_key" ON "card_sets"("code");

-- CreateIndex
CREATE UNIQUE INDEX "cards_dcgId_key" ON "cards"("dcgId");

-- CreateIndex
CREATE INDEX "cards_type_idx" ON "cards"("type");

-- CreateIndex
CREATE INDEX "cards_setCode_idx" ON "cards"("setCode");

-- Full-text search (ADR-003): índice GIN sobre nome + efeitos (config 'simple').
-- A expressão é idêntica à usada em PrismaCardRepository.search (to_tsvector @@ plainto_tsquery).
CREATE INDEX "cards_search_idx" ON "cards" USING GIN (
  to_tsvector('simple', "name" || ' ' || coalesce("effects", ''))
);
