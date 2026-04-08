-- AlterTable
ALTER TABLE "skills" ADD COLUMN     "adjacentSectors" TEXT[],
ADD COLUMN     "escoLevel" INTEGER,
ADD COLUMN     "escoType" TEXT,
ADD COLUMN     "escoUri" TEXT,
ADD COLUMN     "isTransferable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onetCode" TEXT;
