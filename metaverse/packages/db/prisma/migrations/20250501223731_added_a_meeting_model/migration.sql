-- CreateTable
CREATE TABLE "meeting" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meeting_id_key" ON "meeting"("id");

-- AddForeignKey
ALTER TABLE "meeting" ADD CONSTRAINT "meeting_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
