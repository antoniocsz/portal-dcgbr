-- Anúncios/patrocínios do portal (@digimon/ads): house ads, patrocínio direto e
-- links de afiliado. `placements` é lista escalar de posições de exibição;
-- `impressions`/`clicks` são contadores simples (sem PII).

-- CreateEnum
CREATE TYPE "AdKind" AS ENUM ('HOUSE', 'AFFILIATE', 'SPONSOR');

-- CreateTable
CREATE TABLE "ads" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT,
    "targetUrl" TEXT NOT NULL,
    "kind" "AdKind" NOT NULL,
    "placements" TEXT[],
    "ctaLabel" TEXT,
    "sponsorName" TEXT,
    "disclosure" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "openInNewTab" BOOLEAN NOT NULL DEFAULT true,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ads_isActive_idx" ON "ads"("isActive");

-- CreateIndex
CREATE INDEX "ads_kind_idx" ON "ads"("kind");

-- AddForeignKey
ALTER TABLE "ads" ADD CONSTRAINT "ads_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
