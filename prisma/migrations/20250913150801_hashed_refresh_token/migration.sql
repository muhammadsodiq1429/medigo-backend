-- AlterTable
ALTER TABLE "public"."admin" ADD COLUMN     "hashed_refresh_token" VARCHAR(255);

-- AlterTable
ALTER TABLE "public"."doctor" ADD COLUMN     "hashed_refresh_token" VARCHAR(255);

-- AlterTable
ALTER TABLE "public"."patient" ADD COLUMN     "hashed_refresh_token" VARCHAR(255);
