-- ========================================================
-- MIGRATION 004: Add Cover Banner URL to user_bios
-- ========================================================

ALTER TABLE user_bios ADD COLUMN IF NOT EXISTS cover_url TEXT;
