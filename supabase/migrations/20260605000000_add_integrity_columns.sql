-- =============================================================================
-- Migration: Add academic integrity tracking columns to student_responses
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dtvvecquuxmmkvkqauhe/sql
-- =============================================================================

-- paste_attempts: number of times the student tried to paste during the assignment
ALTER TABLE student_responses
  ADD COLUMN IF NOT EXISTS paste_attempts INTEGER NOT NULL DEFAULT 0;

-- tabaway_count: number of times the student's browser tab lost focus during the assignment
ALTER TABLE student_responses
  ADD COLUMN IF NOT EXISTS tabaway_count INTEGER NOT NULL DEFAULT 0;
