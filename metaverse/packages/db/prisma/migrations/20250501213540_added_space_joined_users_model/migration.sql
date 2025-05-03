-- CreateTable
CREATE TABLE "spaceJoinedUsers" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "spaceJoinedUsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "spaceJoinedUsers_id_key" ON "spaceJoinedUsers"("id");

-- AddForeignKey
ALTER TABLE "spaceJoinedUsers" ADD CONSTRAINT "spaceJoinedUsers_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaceJoinedUsers" ADD CONSTRAINT "spaceJoinedUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
