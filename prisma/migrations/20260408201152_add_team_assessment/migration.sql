-- CreateTable
CREATE TABLE "team_assessments" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "managerToken" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "managerEmail" TEXT NOT NULL,
    "responseThreshold" INTEGER NOT NULL DEFAULT 5,
    "expiresAt" TIMESTAMP(3),
    "thresholdNotified" BOOLEAN NOT NULL DEFAULT false,
    "aiReport" JSONB,
    "reportGeneratedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_responses" (
    "id" TEXT NOT NULL,
    "teamAssessmentId" TEXT NOT NULL,
    "scores" JSONB NOT NULL,
    "maxPossible" JSONB NOT NULL,
    "topRoleFamilies" TEXT[],
    "topSkillGaps" TEXT[],
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_assessments_token_key" ON "team_assessments"("token");

-- CreateIndex
CREATE UNIQUE INDEX "team_assessments_managerToken_key" ON "team_assessments"("managerToken");

-- CreateIndex
CREATE INDEX "team_assessments_token_idx" ON "team_assessments"("token");

-- CreateIndex
CREATE INDEX "team_assessments_managerToken_idx" ON "team_assessments"("managerToken");

-- CreateIndex
CREATE INDEX "team_responses_teamAssessmentId_idx" ON "team_responses"("teamAssessmentId");

-- AddForeignKey
ALTER TABLE "team_responses" ADD CONSTRAINT "team_responses_teamAssessmentId_fkey" FOREIGN KEY ("teamAssessmentId") REFERENCES "team_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
