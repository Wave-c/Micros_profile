-- Базовые роли: ADMIN, CUSTOMER, EXECUTOR (см. src/domain/role.ts)
ALTER TABLE "UserProfile" ADD COLUMN "roles" TEXT[] NOT NULL DEFAULT ARRAY['EXECUTOR']::TEXT[];

CREATE INDEX "UserProfile_roles_idx" ON "UserProfile"("roles");
