/*
  Warnings:

  - Added the required column `depth` to the `MapElements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MapElements" ADD COLUMN     "depth" INTEGER NOT NULL;
