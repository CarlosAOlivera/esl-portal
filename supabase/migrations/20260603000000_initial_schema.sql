-- =============================================================================
-- Project ELEVATE — ESL Grade 12 Portal
-- Initial Schema Migration
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. profiles
--    Extends auth.users; stores role and display info.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id               UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email            TEXT NOT NULL UNIQUE,
  full_name        TEXT,
  role             TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('teacher', 'student')),
  avatar_initials  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2. materials
--    Flipped classroom materials (videos, podcasts, PDFs, websites).
--    assignment_id FK is added after assignments table is created below.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS materials (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  unit           TEXT NOT NULL,
  week           INTEGER,
  type           TEXT NOT NULL CHECK (type IN ('video', 'podcast', 'pdf', 'website')),
  url            TEXT,
  description    TEXT,
  publish_date   DATE,
  assignment_id  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 3. assignments
--    In-class assignments with embedded questions stored as JSONB.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assignments (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  unit         TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  instructions TEXT,
  flipped_id   TEXT REFERENCES materials(id) ON DELETE SET NULL,
  questions    JSONB NOT NULL DEFAULT '[]',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign key from materials back to assignments (deferred to avoid circular ref)
ALTER TABLE materials
  ADD CONSTRAINT fk_materials_assignment
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL
  DEFERRABLE INITIALLY DEFERRED;

-- ---------------------------------------------------------------------------
-- 4. student_responses
--    One row per student per assignment.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_responses (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  answers       JSONB NOT NULL DEFAULT '{}',
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, assignment_id)
);

-- =============================================================================
-- updated_at trigger for assignments
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- Row Level Security
-- =============================================================================

-- Enable RLS
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials         ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_responses ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- profiles policies
-- ---------------------------------------------------------------------------

-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Teachers can read all profiles
CREATE POLICY "profiles_select_teacher" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

-- Users can insert their own profile row
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- materials policies
-- ---------------------------------------------------------------------------

-- Any authenticated user can read materials
CREATE POLICY "materials_select_all" ON materials
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only teachers can create, update, or delete materials
CREATE POLICY "materials_write_teacher" ON materials
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

-- ---------------------------------------------------------------------------
-- assignments policies
-- ---------------------------------------------------------------------------

-- Any authenticated user can read assignments
CREATE POLICY "assignments_select_all" ON assignments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only teachers can create, update, or delete assignments
CREATE POLICY "assignments_write_teacher" ON assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

-- ---------------------------------------------------------------------------
-- student_responses policies
-- ---------------------------------------------------------------------------

-- Students can read their own responses
CREATE POLICY "responses_select_own" ON student_responses
  FOR SELECT USING (auth.uid() = student_id);

-- Teachers can read all responses
CREATE POLICY "responses_select_teacher" ON student_responses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

-- Students can submit their own responses
CREATE POLICY "responses_insert_own" ON student_responses
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Students can update their own responses
CREATE POLICY "responses_update_own" ON student_responses
  FOR UPDATE USING (auth.uid() = student_id);

-- =============================================================================
-- Auto-create profile on signup
-- =============================================================================
-- Inserts a profiles row whenever a new user registers via Supabase Auth.
-- The teacher email is hard-coded; all other accounts default to 'student'.
-- Avatar initials are derived from full_name or fall back to the email prefix.
-- =============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, avatar_initials)
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
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
