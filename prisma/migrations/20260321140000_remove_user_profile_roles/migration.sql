-- Роли приходят только из заголовка X-Roles, в профиле не храним
DROP INDEX IF EXISTS "UserProfile_roles_idx";

ALTER TABLE "UserProfile" DROP COLUMN "roles";
