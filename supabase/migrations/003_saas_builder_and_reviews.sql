-- ========================================================
-- MIGRATION 003: Bio Site Builder & User Reviews System
-- ========================================================

-- 1. Site Reviews Table (with admin approval moderation)
CREATE TABLE IF NOT EXISTS site_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_name TEXT NOT NULL,
  user_photo TEXT,
  social_link TEXT,
  rating INTEGER DEFAULT 5,
  comment TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Bio Sites Table (SaaS Bio Builder)
CREATE TABLE IF NOT EXISTS user_bios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  tagline TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  social_links JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  theme TEXT DEFAULT 'orange',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security (RLS)
ALTER TABLE site_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bios ENABLE ROW LEVEL SECURITY;

-- Reviews RLS
CREATE POLICY "Public can view approved reviews"
  ON site_reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Anyone can submit a review"
  ON site_reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role manages all reviews"
  ON site_reviews FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users view own reviews"
  ON site_reviews FOR SELECT
  USING (auth.uid() = user_id);

-- User Bios RLS
CREATE POLICY "Public can view any user bio"
  ON user_bios FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own bio"
  ON user_bios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bio"
  ON user_bios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages all user bios"
  ON user_bios FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_site_reviews_approved ON site_reviews(is_approved, created_at);
CREATE INDEX IF NOT EXISTS idx_user_bios_username ON user_bios(username);
CREATE INDEX IF NOT EXISTS idx_user_bios_user_id ON user_bios(user_id);
