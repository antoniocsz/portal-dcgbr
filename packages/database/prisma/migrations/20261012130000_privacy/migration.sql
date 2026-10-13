-- Tratamento de LGPD (@digimon/privacy): auditoria de consentimento de cookies
-- (analytics/ads) e canal de solicitações do titular (art. 18 §3º).
-- `subjectKey` é um identificador opaco do navegador; `userAgent` é truncado.

-- CreateEnum
CREATE TYPE "DataRequestType" AS ENUM ('ACCESS', 'CORRECTION', 'DELETION', 'PORTABILITY', 'CONSENT_REVOCATION', 'OTHER');

-- CreateEnum
CREATE TYPE "DataRequestStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'REJECTED');

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "subjectKey" TEXT NOT NULL,
    "userId" TEXT,
    "analytics" BOOLEAN NOT NULL,
    "ads" BOOLEAN NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consent_records_subjectKey_idx" ON "consent_records"("subjectKey");

-- CreateIndex
CREATE INDEX "consent_records_userId_idx" ON "consent_records"("userId");

-- CreateIndex
CREATE INDEX "consent_records_createdAt_idx" ON "consent_records"("createdAt");

-- CreateTable
CREATE TABLE "data_requests" (
    "id" TEXT NOT NULL,
    "type" "DataRequestType" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "userId" TEXT,
    "status" "DataRequestStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "data_requests_status_createdAt_idx" ON "data_requests"("status", "createdAt");

-- CreateIndex
CREATE INDEX "data_requests_email_idx" ON "data_requests"("email");

-- CreateIndex
CREATE INDEX "data_requests_userId_idx" ON "data_requests"("userId");

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_requests" ADD CONSTRAINT "data_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
