-- Deckbuild + comunidade de decks (@digimon/cards, @digimon/decks).
-- Cards: novo tipo de carta DIGIEGG + limite de cópias por deck (maxCountInDeck).
-- Decks: lista dupla (eggList) + carta de capa (coverCardId).
-- Comunidade: snapshot congelado de decks publicados + engajamento + moderação.

-- CreateEnum
CREATE TYPE "PublicDeckStatus" AS ENUM ('PUBLIC', 'HIDDEN', 'UNPUBLISHED');

-- AlterEnum
ALTER TYPE "CardType" ADD VALUE 'DIGIEGG';

-- AlterTable
ALTER TABLE "decks" ADD COLUMN     "coverCardId" TEXT,
ADD COLUMN     "eggList" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "maxCountInDeck" INTEGER NOT NULL DEFAULT 4;

-- CreateTable
CREATE TABLE "public_decks" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "sourceDeckId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colors" JSONB NOT NULL DEFAULT '[]',
    "cardList" JSONB NOT NULL,
    "eggList" JSONB NOT NULL DEFAULT '[]',
    "coverCardId" TEXT,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "copyCount" INTEGER NOT NULL DEFAULT 0,
    "status" "PublicDeckStatus" NOT NULL DEFAULT 'PUBLIC',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "public_decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_deck_likes" (
    "id" TEXT NOT NULL,
    "publicDeckId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "public_deck_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_deck_copies" (
    "id" TEXT NOT NULL,
    "publicDeckId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "public_deck_copies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_deck_reports" (
    "id" TEXT NOT NULL,
    "publicDeckId" TEXT NOT NULL,
    "reporterAccountId" TEXT,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dismissedAt" TIMESTAMP(3),

    CONSTRAINT "community_deck_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "public_decks_status_likeCount_idx" ON "public_decks"("status", "likeCount");

-- CreateIndex
CREATE INDEX "public_decks_status_publishedAt_idx" ON "public_decks"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "public_decks_accountId_sourceDeckId_key" ON "public_decks"("accountId", "sourceDeckId");

-- CreateIndex
CREATE UNIQUE INDEX "public_deck_likes_publicDeckId_accountId_key" ON "public_deck_likes"("publicDeckId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "public_deck_copies_publicDeckId_accountId_key" ON "public_deck_copies"("publicDeckId", "accountId");

-- CreateIndex
CREATE INDEX "community_deck_reports_publicDeckId_dismissedAt_idx" ON "community_deck_reports"("publicDeckId", "dismissedAt");

-- AddForeignKey
ALTER TABLE "public_decks" ADD CONSTRAINT "public_decks_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_decks" ADD CONSTRAINT "public_decks_sourceDeckId_fkey" FOREIGN KEY ("sourceDeckId") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_deck_likes" ADD CONSTRAINT "public_deck_likes_publicDeckId_fkey" FOREIGN KEY ("publicDeckId") REFERENCES "public_decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_deck_likes" ADD CONSTRAINT "public_deck_likes_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_deck_copies" ADD CONSTRAINT "public_deck_copies_publicDeckId_fkey" FOREIGN KEY ("publicDeckId") REFERENCES "public_decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_deck_copies" ADD CONSTRAINT "public_deck_copies_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_deck_reports" ADD CONSTRAINT "community_deck_reports_publicDeckId_fkey" FOREIGN KEY ("publicDeckId") REFERENCES "public_decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_deck_reports" ADD CONSTRAINT "community_deck_reports_reporterAccountId_fkey" FOREIGN KEY ("reporterAccountId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
