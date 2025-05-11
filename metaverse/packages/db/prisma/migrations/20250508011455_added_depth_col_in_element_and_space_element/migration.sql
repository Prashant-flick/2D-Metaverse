/*
  Warnings:

  - Added the required column `depth` to the `Element` table without a default value. This is not possible if the table is not empty.
  - Added the required column `depth` to the `spaceElements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Element" ADD COLUMN     "depth" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "spaceElements" ADD COLUMN     "depth" INTEGER NOT NULL;
