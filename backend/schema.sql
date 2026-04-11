-- ============================================================
-- CareerLens - Complete Schema Fix
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================================

-- Drop old tables to start clean
DROP TABLE IF EXISTS public.signal_snapshots CASCADE;
DROP TABLE IF EXISTS public.monthly_checkins CASCADE;
DROP TABLE IF EXISTS public.career_reports CASCADE;
DROP TABLE IF EXISTS public.onboarding_answers CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop old trigger/function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ============================================================
-- 1. users table — mirrors auth.users
-- ============================================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    email TEXT,
    name TEXT,
    age INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- Auto-create public.users row when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Back-fill any existing auth users who signed up before the trigger existed
INSERT INTO public.users (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. onboarding_answers
-- ============================================================
CREATE TABLE public.onboarding_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,  -- intentionally no FK so answers always save
    question_key TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.onboarding_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON public.onboarding_answers FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 3. career_reports
-- ============================================================
CREATE TABLE public.career_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,  -- intentionally no FK
    career_identity TEXT,
    career_identity_description TEXT,
    top_matches JSONB,
    strengths JSONB,
    misalignment_insight TEXT,
    shadow_career TEXT,
    skill_bridge TEXT,
    skill_gap TEXT,
    roadmap JSONB,
    day_in_life JSONB DEFAULT '[]',
    indian_examples JSONB DEFAULT '[]',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.career_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON public.career_reports FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 4. monthly_checkins
-- ============================================================
CREATE TABLE public.monthly_checkins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    checkin_month DATE NOT NULL,
    answers JSONB NOT NULL,
    drift_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.monthly_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON public.monthly_checkins FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 5. signal_snapshots
-- ============================================================
CREATE TABLE public.signal_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    snapshot_month DATE NOT NULL,
    signal_scores JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.signal_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON public.signal_snapshots FOR ALL USING (true) WITH CHECK (true);
