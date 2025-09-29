/*
  Warnings:

  - You are about to drop the column `dosage` on the `Treatment` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Treatment` table. All the data in the column will be lost.
  - Added the required column `dateOfBirth` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `visitType` to the `Visit` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."VisitType" AS ENUM ('CHECKUP', 'EMERGENCY', 'FOLLOWUP', 'SPECIALIST', 'ROUTINE');

-- CreateEnum
CREATE TYPE "public"."AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "public"."TrendDirection" AS ENUM ('INCREASING', 'DECREASING', 'STABLE', 'FLUCTUATING');

-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'RECEPTIONIST';

-- AlterTable
ALTER TABLE "public"."Patient" ADD COLUMN     "address" TEXT,
ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "bloodType" TEXT,
ADD COLUMN     "chronicConditions" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Treatment" DROP COLUMN "dosage",
DROP COLUMN "notes",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "instructions" TEXT;

-- AlterTable
ALTER TABLE "public"."Visit" ADD COLUMN     "assessment" TEXT,
ADD COLUMN     "chiefComplaint" TEXT,
ADD COLUMN     "followUpDate" TIMESTAMP(3),
ADD COLUMN     "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "objective" TEXT,
ADD COLUMN     "plan" TEXT,
ADD COLUMN     "staffId" TEXT,
ADD COLUMN     "subjective" TEXT,
ADD COLUMN     "visitType" "public"."VisitType" NOT NULL;

-- CreateTable
CREATE TABLE "public"."Staff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "specialization" TEXT,
    "licenseNumber" TEXT,
    "contactInfo" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VitalSigns" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "visitId" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bloodPressureSystolic" INTEGER,
    "bloodPressureDiastolic" INTEGER,
    "heartRate" INTEGER,
    "temperature" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "bloodSugar" DOUBLE PRECISION,
    "oxygenSaturation" INTEGER,
    "respiratoryRate" INTEGER,
    "notes" TEXT,

    CONSTRAINT "VitalSigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LabResult" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "visitId" TEXT,
    "testName" TEXT NOT NULL,
    "testCategory" TEXT NOT NULL,
    "resultValue" TEXT NOT NULL,
    "normalRange" TEXT,
    "units" TEXT,
    "isAbnormal" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Diagnosis" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "visitId" TEXT,
    "icd10Code" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isChronic" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Diagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Medication" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "route" TEXT,
    "purpose" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "prescribedBy" TEXT,
    "notes" TEXT,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Prescription" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "medication" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "instructions" TEXT,
    "prescribedBy" TEXT,
    "isDispensed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HealthAlert" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "public"."AlertSeverity" NOT NULL,
    "relatedData" TEXT,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "HealthAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HealthTrend" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "trend" "public"."TrendDirection" NOT NULL,
    "period" TEXT NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL,
    "previousValue" DOUBLE PRECISION NOT NULL,
    "changePercentage" DOUBLE PRECISION NOT NULL,
    "summary" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthTrend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TreatmentPattern" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patternType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "frequency" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TreatmentPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Appointment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "staffId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "purpose" TEXT,
    "type" "public"."VisitType" NOT NULL,
    "status" "public"."AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "reminderSentAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemAnalytic" (
    "id" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "period" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department" TEXT,
    "metadata" TEXT,

    CONSTRAINT "SystemAnalytic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT,
    "userRole" TEXT,
    "resource" TEXT,
    "resourceId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_userId_key" ON "public"."Staff"("userId");

-- CreateIndex
CREATE INDEX "Staff_firstName_lastName_idx" ON "public"."Staff"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "Staff_department_idx" ON "public"."Staff"("department");

-- CreateIndex
CREATE INDEX "Staff_licenseNumber_idx" ON "public"."Staff"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "VitalSigns_visitId_key" ON "public"."VitalSigns"("visitId");

-- CreateIndex
CREATE INDEX "VitalSigns_patientId_idx" ON "public"."VitalSigns"("patientId");

-- CreateIndex
CREATE INDEX "VitalSigns_recordedAt_idx" ON "public"."VitalSigns"("recordedAt");

-- CreateIndex
CREATE INDEX "VitalSigns_patientId_recordedAt_idx" ON "public"."VitalSigns"("patientId", "recordedAt");

-- CreateIndex
CREATE INDEX "LabResult_patientId_idx" ON "public"."LabResult"("patientId");

-- CreateIndex
CREATE INDEX "LabResult_testName_idx" ON "public"."LabResult"("testName");

-- CreateIndex
CREATE INDEX "LabResult_date_idx" ON "public"."LabResult"("date");

-- CreateIndex
CREATE INDEX "LabResult_isAbnormal_idx" ON "public"."LabResult"("isAbnormal");

-- CreateIndex
CREATE INDEX "Diagnosis_patientId_idx" ON "public"."Diagnosis"("patientId");

-- CreateIndex
CREATE INDEX "Diagnosis_icd10Code_idx" ON "public"."Diagnosis"("icd10Code");

-- CreateIndex
CREATE INDEX "Diagnosis_isChronic_idx" ON "public"."Diagnosis"("isChronic");

-- CreateIndex
CREATE INDEX "Diagnosis_date_idx" ON "public"."Diagnosis"("date");

-- CreateIndex
CREATE INDEX "Medication_patientId_idx" ON "public"."Medication"("patientId");

-- CreateIndex
CREATE INDEX "Medication_name_idx" ON "public"."Medication"("name");

-- CreateIndex
CREATE INDEX "Medication_isActive_idx" ON "public"."Medication"("isActive");

-- CreateIndex
CREATE INDEX "Medication_startDate_idx" ON "public"."Medication"("startDate");

-- CreateIndex
CREATE INDEX "Prescription_visitId_idx" ON "public"."Prescription"("visitId");

-- CreateIndex
CREATE INDEX "Prescription_createdAt_idx" ON "public"."Prescription"("createdAt");

-- CreateIndex
CREATE INDEX "HealthAlert_patientId_idx" ON "public"."HealthAlert"("patientId");

-- CreateIndex
CREATE INDEX "HealthAlert_type_idx" ON "public"."HealthAlert"("type");

-- CreateIndex
CREATE INDEX "HealthAlert_severity_idx" ON "public"."HealthAlert"("severity");

-- CreateIndex
CREATE INDEX "HealthAlert_triggeredAt_idx" ON "public"."HealthAlert"("triggeredAt");

-- CreateIndex
CREATE INDEX "HealthAlert_isResolved_idx" ON "public"."HealthAlert"("isResolved");

-- CreateIndex
CREATE INDEX "HealthTrend_patientId_idx" ON "public"."HealthTrend"("patientId");

-- CreateIndex
CREATE INDEX "HealthTrend_metric_idx" ON "public"."HealthTrend"("metric");

-- CreateIndex
CREATE INDEX "HealthTrend_trend_idx" ON "public"."HealthTrend"("trend");

-- CreateIndex
CREATE INDEX "HealthTrend_calculatedAt_idx" ON "public"."HealthTrend"("calculatedAt");

-- CreateIndex
CREATE INDEX "TreatmentPattern_patientId_idx" ON "public"."TreatmentPattern"("patientId");

-- CreateIndex
CREATE INDEX "TreatmentPattern_patternType_idx" ON "public"."TreatmentPattern"("patternType");

-- CreateIndex
CREATE INDEX "TreatmentPattern_detectedAt_idx" ON "public"."TreatmentPattern"("detectedAt");

-- CreateIndex
CREATE INDEX "Appointment_patientId_idx" ON "public"."Appointment"("patientId");

-- CreateIndex
CREATE INDEX "Appointment_scheduledAt_idx" ON "public"."Appointment"("scheduledAt");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "public"."Appointment"("status");

-- CreateIndex
CREATE INDEX "Appointment_staffId_idx" ON "public"."Appointment"("staffId");

-- CreateIndex
CREATE INDEX "Appointment_patientId_scheduledAt_idx" ON "public"."Appointment"("patientId", "scheduledAt");

-- CreateIndex
CREATE INDEX "SystemAnalytic_metric_idx" ON "public"."SystemAnalytic"("metric");

-- CreateIndex
CREATE INDEX "SystemAnalytic_date_idx" ON "public"."SystemAnalytic"("date");

-- CreateIndex
CREATE INDEX "SystemAnalytic_period_idx" ON "public"."SystemAnalytic"("period");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "public"."AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "public"."AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_resource_resourceId_idx" ON "public"."AuditLog"("resource", "resourceId");

-- CreateIndex
CREATE INDEX "PasswordReset_userId_idx" ON "public"."PasswordReset"("userId");

-- CreateIndex
CREATE INDEX "PasswordReset_tokenHash_idx" ON "public"."PasswordReset"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordReset_expiresAt_idx" ON "public"."PasswordReset"("expiresAt");

-- CreateIndex
CREATE INDEX "Patient_firstName_lastName_idx" ON "public"."Patient"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "Patient_dateOfBirth_idx" ON "public"."Patient"("dateOfBirth");

-- CreateIndex
CREATE INDEX "Patient_createdAt_idx" ON "public"."Patient"("createdAt");

-- CreateIndex
CREATE INDEX "Patient_isActive_idx" ON "public"."Patient"("isActive");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "public"."RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_tokenHash_idx" ON "public"."RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "public"."RefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Treatment_visitId_idx" ON "public"."Treatment"("visitId");

-- CreateIndex
CREATE INDEX "Treatment_name_idx" ON "public"."Treatment"("name");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "public"."User"("createdAt");

-- CreateIndex
CREATE INDEX "VerificationCode_userId_idx" ON "public"."VerificationCode"("userId");

-- CreateIndex
CREATE INDEX "VerificationCode_code_idx" ON "public"."VerificationCode"("code");

-- CreateIndex
CREATE INDEX "VerificationCode_expiresAt_idx" ON "public"."VerificationCode"("expiresAt");

-- CreateIndex
CREATE INDEX "Visit_patientId_idx" ON "public"."Visit"("patientId");

-- CreateIndex
CREATE INDEX "Visit_date_idx" ON "public"."Visit"("date");

-- CreateIndex
CREATE INDEX "Visit_visitType_idx" ON "public"."Visit"("visitType");

-- CreateIndex
CREATE INDEX "Visit_staffId_idx" ON "public"."Visit"("staffId");

-- CreateIndex
CREATE INDEX "Visit_patientId_date_idx" ON "public"."Visit"("patientId", "date");

-- AddForeignKey
ALTER TABLE "public"."Staff" ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Visit" ADD CONSTRAINT "Visit_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VitalSigns" ADD CONSTRAINT "VitalSigns_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VitalSigns" ADD CONSTRAINT "VitalSigns_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "public"."Visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabResult" ADD CONSTRAINT "LabResult_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabResult" ADD CONSTRAINT "LabResult_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "public"."Visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Diagnosis" ADD CONSTRAINT "Diagnosis_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Diagnosis" ADD CONSTRAINT "Diagnosis_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "public"."Visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Medication" ADD CONSTRAINT "Medication_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "public"."Visit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HealthAlert" ADD CONSTRAINT "HealthAlert_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HealthTrend" ADD CONSTRAINT "HealthTrend_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TreatmentPattern" ADD CONSTRAINT "TreatmentPattern_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
