-- CreateEnum
CREATE TYPE "public"."doctor_ver_status_enum" AS ENUM ('draft', 'under_review', 'verified', 'rejected', 'suspended');

-- CreateEnum
CREATE TYPE "public"."appointment_status_enum" AS ENUM ('pending', 'paid', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."weekday_enum" AS ENUM ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');

-- CreateEnum
CREATE TYPE "public"."region_enum" AS ENUM ('Andijon', 'Buxoro', 'Farg‘ona', 'Jizzax', 'Xorazm', 'Namangan', 'Navoiy', 'Qashqadaryo', 'Qoraqalpog‘iston', 'Samarqand', 'Sirdaryo', 'Surxondaryo', 'Toshkent viloyati', 'Toshkent shahar');

-- CreateTable
CREATE TABLE "public"."admin" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "fullname" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_superadmin" BOOLEAN NOT NULL DEFAULT false,
    "hashed_password" VARCHAR(255) NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."doctor" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "gender" VARCHAR(16) NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "avatar_url" VARCHAR(255) NOT NULL,
    "verification_status" "public"."doctor_ver_status_enum" NOT NULL DEFAULT 'draft',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "region" "public"."region_enum" NOT NULL,
    "average_rating" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "hashed_password" VARCHAR(255) NOT NULL,
    "since_experience" DATE NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_type" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "required" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "document_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."doctor_documents" (
    "id" SERIAL NOT NULL,
    "type_id" INTEGER NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,

    CONSTRAINT "doctor_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_type" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,

    CONSTRAINT "service_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."doctor_service" (
    "id" SERIAL NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "doctor_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."doctor_schedule" (
    "id" SERIAL NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "weekday" "public"."weekday_enum" NOT NULL,

    CONSTRAINT "doctor_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."doctor_cards" (
    "id" SERIAL NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "card_number" INTEGER NOT NULL,
    "exp_month" INTEGER NOT NULL,
    "exp_year" INTEGER NOT NULL,
    "status" VARCHAR(16) NOT NULL,
    "is_main" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "doctor_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patient" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "gender" VARCHAR(16) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "avatar_url" VARCHAR(255) NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "hashed_password" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patient_saved_doctors" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "doctor_id" INTEGER NOT NULL,

    CONSTRAINT "patient_saved_doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patient_cards" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "card_number" INTEGER NOT NULL,
    "exp_month" INTEGER NOT NULL,
    "exp_year" INTEGER NOT NULL,
    "status" VARCHAR(16) NOT NULL,
    "is_main" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "patient_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."specialization" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "specialization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."doctor_specialization" (
    "id" SERIAL NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "specialization_id" INTEGER NOT NULL,

    CONSTRAINT "doctor_specialization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."appointment" (
    "id" SERIAL NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "status" "public"."appointment_status_enum" NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."review" (
    "id" SERIAL NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "author" VARCHAR(16) NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "appointment_id" INTEGER NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment" (
    "id" SERIAL NOT NULL,
    "appointment_id" INTEGER NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "status" "public"."appointment_status_enum" NOT NULL DEFAULT 'paid',
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_username_key" ON "public"."admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_email_key" ON "public"."doctor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_phone_key" ON "public"."doctor"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "document_type_code_key" ON "public"."document_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_documents_type_id_doctor_id_key" ON "public"."doctor_documents"("type_id", "doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_service_doctor_id_type_id_key" ON "public"."doctor_service"("doctor_id", "type_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_schedule_doctor_id_weekday_key" ON "public"."doctor_schedule"("doctor_id", "weekday");

-- CreateIndex
CREATE UNIQUE INDEX "uq_doctor_card_one_main"
  ON "public"."doctor_cards"("doctor_id") WHERE "is_main";

-- CreateIndex
CREATE UNIQUE INDEX "doctor_cards_doctor_id_card_number_exp_month_exp_year_key" ON "public"."doctor_cards"("doctor_id", "card_number", "exp_month", "exp_year");

-- CreateIndex
CREATE UNIQUE INDEX "patient_phone_key" ON "public"."patient"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "patient_email_key" ON "public"."patient"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patient_saved_doctors_patient_id_doctor_id_key" ON "public"."patient_saved_doctors"("patient_id", "doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_patient_card_one_main"
  ON "public"."patient_cards"("patient_id") WHERE "is_main";

-- CreateIndex
CREATE UNIQUE INDEX "patient_cards_patient_id_card_number_exp_month_exp_year_key" ON "public"."patient_cards"("patient_id", "card_number", "exp_month", "exp_year");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_specialization_doctor_id_specialization_id_key" ON "public"."doctor_specialization"("doctor_id", "specialization_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_appointment_id_author_key" ON "public"."review"("appointment_id", "author");

-- CreateIndex
CREATE UNIQUE INDEX "payment_appointment_id_key" ON "public"."payment"("appointment_id");
