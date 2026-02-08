-- CreateTable
CREATE TABLE "UserProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "telegramId" INTEGER,
    "username" TEXT,
    "email" TEXT,
    "fullName" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "location" TEXT,
    "roles" TEXT[] DEFAULT ARRAY['EXECUTOR']::TEXT[],
    "stack" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specialization" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experienceLevel" TEXT DEFAULT 'JUNIOR',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "rating" DOUBLE PRECISION DEFAULT 0.0,
    "completedJobs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_telegramId_key" ON "UserProfile"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_username_key" ON "UserProfile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");

-- CreateIndex
CREATE INDEX "UserProfile_status_idx" ON "UserProfile"("status");

-- CreateIndex
CREATE INDEX "UserProfile_roles_idx" ON "UserProfile"("roles");

-- CreateIndex
CREATE INDEX "UserProfile_stack_idx" ON "UserProfile"("stack");

-- CreateIndex
CREATE INDEX "UserProfile_specialization_idx" ON "UserProfile"("specialization");

-- CreateIndex
CREATE INDEX "UserProfile_experienceLevel_idx" ON "UserProfile"("experienceLevel");

-- CreateIndex
CREATE INDEX "UserProfile_rating_idx" ON "UserProfile"("rating");
