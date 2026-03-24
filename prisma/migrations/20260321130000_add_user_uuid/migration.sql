-- AlterTable: UUID из шлюза (X-User-Id), userId (Int) не трогаем
ALTER TABLE "UserProfile" ADD COLUMN "userUuid" TEXT;

CREATE UNIQUE INDEX "UserProfile_userUuid_key" ON "UserProfile"("userUuid");
