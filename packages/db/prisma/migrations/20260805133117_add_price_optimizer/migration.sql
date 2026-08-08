-- CreateEnum
CREATE TYPE "CollectionType" AS ENUM ('KEYWORD_SEARCH', 'PRODUCT_TRACK');

-- CreateEnum
CREATE TYPE "CollectionStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "price_history" ADD COLUMN     "changePercent" DOUBLE PRECISION,
ADD COLUMN     "priceChange" DECIMAL(15,2),
ADD COLUMN     "sessionId" TEXT;

-- CreateTable
CREATE TABLE "collection_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CollectionType" NOT NULL,
    "marketplace" "Marketplace" NOT NULL,
    "keyword" TEXT,
    "minPrice" DECIMAL(15,2),
    "maxPrice" DECIMAL(15,2),
    "maxPages" INTEGER NOT NULL DEFAULT 3,
    "productUrls" TEXT[],
    "cronExpr" TEXT NOT NULL DEFAULT '0 */6 * * *',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "totalRuns" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_sessions" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "CollectionStatus" NOT NULL DEFAULT 'RUNNING',
    "totalJobs" INTEGER NOT NULL DEFAULT 0,
    "completedJobs" INTEGER NOT NULL DEFAULT 0,
    "failedJobs" INTEGER NOT NULL DEFAULT 0,
    "productsFound" INTEGER NOT NULL DEFAULT 0,
    "priceChanges" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "errorMessage" TEXT,

    CONSTRAINT "collection_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_logs" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "collection_plans_isActive_nextRunAt_idx" ON "collection_plans"("isActive", "nextRunAt");

-- CreateIndex
CREATE INDEX "collection_plans_marketplace_idx" ON "collection_plans"("marketplace");

-- CreateIndex
CREATE INDEX "collection_sessions_planId_startedAt_idx" ON "collection_sessions"("planId", "startedAt");

-- CreateIndex
CREATE INDEX "collection_sessions_status_idx" ON "collection_sessions"("status");

-- CreateIndex
CREATE INDEX "collection_logs_sessionId_createdAt_idx" ON "collection_logs"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "price_history_scrapedAt_idx" ON "price_history"("scrapedAt");

-- CreateIndex
CREATE INDEX "price_history_sessionId_idx" ON "price_history"("sessionId");

-- AddForeignKey
ALTER TABLE "collection_sessions" ADD CONSTRAINT "collection_sessions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "collection_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_logs" ADD CONSTRAINT "collection_logs_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "collection_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
