/*
  Warnings:

  - The `gender` column on the `patient` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `gender` on the `doctor` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `hashed_password` on table `patient` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."gender" AS ENUM ('male', 'female');

-- AlterTable
ALTER TABLE "public"."doctor" DROP COLUMN "gender",
ADD COLUMN     "gender" "public"."gender" NOT NULL,
ALTER COLUMN "date_of_birth" DROP NOT NULL,
ALTER COLUMN "avatar_url" DROP NOT NULL,
ALTER COLUMN "verification_status" DROP NOT NULL,
ALTER COLUMN "is_active" DROP NOT NULL,
ALTER COLUMN "is_active" SET DEFAULT false,
ALTER COLUMN "region" DROP NOT NULL,
ALTER COLUMN "average_rating" DROP NOT NULL,
ALTER COLUMN "review_count" DROP NOT NULL,
ALTER COLUMN "balance" DROP NOT NULL,
ALTER COLUMN "since_experience" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."patient" ALTER COLUMN "last_name" DROP NOT NULL,
DROP COLUMN "gender",
ADD COLUMN     "gender" "public"."gender",
ALTER COLUMN "is_active" DROP NOT NULL,
ALTER COLUMN "is_active" SET DEFAULT false,
ALTER COLUMN "avatar_url" DROP NOT NULL,
ALTER COLUMN "date_of_birth" DROP NOT NULL,
ALTER COLUMN "hashed_password" SET NOT NULL;
