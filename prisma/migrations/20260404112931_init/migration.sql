-- CreateEnum
CREATE TYPE "CareerSector" AS ENUM ('Operations & Maintenance', 'Marine Operations', 'Survey & Design', 'Health, Safety & Environment', 'Electrical', 'Policy & Regulation', 'Project Management');

-- CreateEnum
CREATE TYPE "EntryLevel" AS ENUM ('Apprentice', 'Entry', 'Mid', 'Senior', 'Leadership');

-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('University', 'ETB', 'Private', 'Industry', 'Skillnet_Network', 'Government');

-- CreateEnum
CREATE TYPE "DeliveryFormat" AS ENUM ('In-Person', 'Online', 'Blended', 'Self-Paced');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('Workshop', 'Webinar', 'Conference', 'Networking', 'Training', 'Roadshow');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('Physical', 'Virtual', 'Hybrid');

-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('Technical', 'Safety', 'Regulatory', 'Digital', 'Management');

-- CreateEnum
CREATE TYPE "PathwayType" AS ENUM ('progression', 'lateral', 'specialisation');

-- CreateEnum
CREATE TYPE "DiagnosticQuestionType" AS ENUM ('single_choice', 'multiple_choice', 'scale');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('CAREER', 'COURSE', 'EVENT', 'RESEARCH', 'NEWS');

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "SkillCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "careers" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sector" "CareerSector" NOT NULL,
    "entryLevel" "EntryLevel" NOT NULL,
    "description" TEXT NOT NULL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "keyResponsibilities" TEXT[],
    "qualifications" TEXT[],
    "workingConditions" TEXT,
    "growthOutlook" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishAt" TIMESTAMP(3),
    "rejectionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "careers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_skills" (
    "careerId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "career_skills_pkey" PRIMARY KEY ("careerId","skillId")
);

-- CreateTable
CREATE TABLE "pathway_connections" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "type" "PathwayType" NOT NULL,
    "timeframe" TEXT NOT NULL,

    CONSTRAINT "pathway_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerType" "ProviderType" NOT NULL,
    "description" TEXT NOT NULL,
    "entryRequirements" TEXT,
    "deliveryFormat" "DeliveryFormat" NOT NULL,
    "location" TEXT,
    "nfqLevel" INTEGER,
    "duration" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costNotes" TEXT,
    "nextStartDate" TIMESTAMP(3),
    "accredited" BOOLEAN NOT NULL DEFAULT false,
    "certificationAwarded" TEXT,
    "tags" TEXT[],
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishAt" TIMESTAMP(3),
    "rejectionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_skills" (
    "courseId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "course_skills_pkey" PRIMARY KEY ("courseId","skillId")
);

-- CreateTable
CREATE TABLE "course_careers" (
    "courseId" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,

    CONSTRAINT "course_careers_pkey" PRIMARY KEY ("courseId","careerId")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "locationType" "LocationType" NOT NULL,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "capacity" INTEGER,
    "image" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishAt" TIMESTAMP(3),
    "rejectionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "organisation" TEXT NOT NULL,
    "publicationDate" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "categories" TEXT[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishAt" TIMESTAMP(3),
    "rejectionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "image" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishAt" TIMESTAMP(3),
    "rejectionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_questions" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "DiagnosticQuestionType" NOT NULL,
    "options" JSONB,
    "scaleMin" INTEGER,
    "scaleMax" INTEGER,
    "scaleLabels" JSONB,
    "scoreImpact" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_versions" (
    "id" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "contentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "changeNote" TEXT,
    "changedById" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "skills_slug_key" ON "skills"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "careers_slug_key" ON "careers"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pathway_connections_fromId_toId_key" ON "pathway_connections"("fromId", "toId");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "research_slug_key" ON "research"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "news_articles_slug_key" ON "news_articles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "content_versions_contentType_contentId_idx" ON "content_versions"("contentType", "contentId");

-- CreateIndex
CREATE UNIQUE INDEX "content_versions_contentType_contentId_version_key" ON "content_versions"("contentType", "contentId", "version");

-- AddForeignKey
ALTER TABLE "career_skills" ADD CONSTRAINT "career_skills_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_skills" ADD CONSTRAINT "career_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pathway_connections" ADD CONSTRAINT "pathway_connections_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pathway_connections" ADD CONSTRAINT "pathway_connections_toId_fkey" FOREIGN KEY ("toId") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_skills" ADD CONSTRAINT "course_skills_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_skills" ADD CONSTRAINT "course_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_careers" ADD CONSTRAINT "course_careers_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_careers" ADD CONSTRAINT "course_careers_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
