-- =============================================================================
-- Project ELEVATE — Add missing columns
-- Migration: 20260618000000_add_missing_columns
-- =============================================================================

-- ---------------------------------------------------------------------------
-- profiles: add group_number
-- ---------------------------------------------------------------------------
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS group_number INTEGER;

-- ---------------------------------------------------------------------------
-- student_responses: add academic integrity tracking + reviewed flag
-- ---------------------------------------------------------------------------
ALTER TABLE student_responses
  ADD COLUMN IF NOT EXISTS paste_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tabaway_count  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reviewed       BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reviewed_at    TIMESTAMPTZ;

-- RLS: teachers can update reviewed / reviewed_at on any response
CREATE POLICY "responses_update_teacher" ON student_responses
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );
