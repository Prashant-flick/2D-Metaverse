/*
  Warnings:

  - A unique constraint covering the columns `[spaceId,userId]` on the table `spaceJoinedUsers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "spaceJoinedUsers_spaceId_userId_key" ON "spaceJoinedUsers"("spaceId", "userId");
