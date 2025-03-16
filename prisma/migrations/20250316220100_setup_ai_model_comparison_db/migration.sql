-- CreateTable
CREATE TABLE "QueryHistory" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "responses" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueryHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QueryHistory_timestamp_idx" ON "QueryHistory"("timestamp");
