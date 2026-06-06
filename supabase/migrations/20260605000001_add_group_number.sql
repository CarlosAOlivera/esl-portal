-- =============================================================================
-- Migration: Add group_number to profiles + update handle_new_user trigger
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dtvvecquuxmmkvkqauhe/sql
-- =============================================================================

-- 1. Add group_number column to profiles (1–5, nullable for teacher)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS group_number INTEGER
  CHECK (group_number IS NULL OR group_number BETWEEN 1 AND 5);

-- 2. Update handle_new_user to save group_number from signup metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, avatar_initials, group_number)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    CASE
      WHEN NEW.email = 'de142118@miescuela.pr' THEN 'teacher'
      ELSE 'student'
    END,
    UPPER(
      LEFT(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 1) ||
      COALESCE(
        SUBSTRING(NEW.raw_user_meta_data->>'full_name' FROM ' ([^ ]+)$'),
        LEFT(NEW.email, 1)
      )
    ),
    NULLIF(NEW.raw_user_meta_data->>'group_number', '')::INTEGER
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
