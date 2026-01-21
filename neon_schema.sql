-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Job Table
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "type" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "result" TEXT,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Schedule Table
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "url" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "day" TEXT,
    "lastRun" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create EngagementMetric Table
CREATE TABLE "EngagementMetric" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "jobId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "summary" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Index for Scheduler Performance
CREATE INDEX "Job_status_runAt_idx" ON "Job"("status", "runAt");
