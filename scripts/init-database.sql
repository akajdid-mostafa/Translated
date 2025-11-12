-- Initialize database tables for Translated.ae clone
-- This script creates the necessary tables for the translation service

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Translation requests table
CREATE TABLE IF NOT EXISTS "TranslationRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerAddress" TEXT,
    "sourceLanguage" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'STANDARD',
    "specialization" TEXT,
    "additionalNotes" TEXT,
    "originalFileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "estimatedPrice" REAL,
    "finalPrice" REAL,
    "estimatedDelivery" DATETIME,
    "actualDelivery" DATETIME,
    "adminNotes" TEXT,
    "assignedTo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Status history table for tracking request status changes
CREATE TABLE IF NOT EXISTS "StatusHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "changedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("requestId") REFERENCES "TranslationRequest"("id") ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "TranslationRequest_status_idx" ON "TranslationRequest"("status");
CREATE INDEX IF NOT EXISTS "TranslationRequest_customerEmail_idx" ON "TranslationRequest"("customerEmail");
CREATE INDEX IF NOT EXISTS "TranslationRequest_createdAt_idx" ON "TranslationRequest"("createdAt");
CREATE INDEX IF NOT EXISTS "StatusHistory_requestId_idx" ON "StatusHistory"("requestId");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
