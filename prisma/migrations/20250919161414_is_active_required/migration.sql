/*
  Warnings:

  - Made the column `is_active` on table `doctor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_active` on table `patient` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."doctor" ALTER COLUMN "is_active" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."patient" ALTER COLUMN "is_active" SET NOT NULL;
