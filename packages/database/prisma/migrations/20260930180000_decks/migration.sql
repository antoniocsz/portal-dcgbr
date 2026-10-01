-- CreateEnum
CREATE TYPE "DeckStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "decks" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "description" TEXT,
    "cardList" JSONB NOT NULL,
    "format" TEXT NOT NULL,
    "status" "DeckStatus" NOT NULL DEFAULT 'DRAFT',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deck_copies" (
    "id" TEXT NOT NULL,
    "sourceDeckId" TEXT NOT NULL,
    "copiedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deck_copies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "decks_slug_key" ON "decks"("slug");

-- CreateIndex
CREATE INDEX "decks_status_isPublic_idx" ON "decks"("status", "isPublic");

-- CreateIndex
CREATE INDEX "decks_ownerId_idx" ON "decks"("ownerId");

-- CreateIndex
CREATE INDEX "decks_format_idx" ON "decks"("format");

-- CreateIndex
CREATE INDEX "deck_copies_sourceDeckId_idx" ON "deck_copies"("sourceDeckId");

-- CreateIndex
CREATE INDEX "deck_copies_copiedById_idx" ON "deck_copies"("copiedById");

-- AddForeignKey
ALTER TABLE "decks" ADD CONSTRAINT "decks_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_copies" ADD CONSTRAINT "deck_copies_sourceDeckId_fkey" FOREIGN KEY ("sourceDeckId") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_copies" ADD CONSTRAINT "deck_copies_copiedById_fkey" FOREIGN KEY ("copiedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Full-text search (ADR-003): índice GIN sobre o nome do deck (config 'simple').
-- A expressão é idêntica à usada em PrismaDeckRepository.list (to_tsvector @@ plainto_tsquery).
CREATE INDEX "decks_search_idx" ON "decks" USING GIN (
  to_tsvector('simple', "name")
);

