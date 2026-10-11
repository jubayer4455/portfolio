-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Site settings (key-value)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery categories
CREATE TABLE IF NOT EXISTS gallery_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery images
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  alt_text TEXT,
  caption TEXT,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  width INTEGER,
  height INTEGER,
  category_id UUID REFERENCES gallery_categories(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  seo_title TEXT,
  seo_description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social profiles
CREATE TABLE IF NOT EXISTS social_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  display_label TEXT NOT NULL,
  profile_url TEXT NOT NULL,
  icon_name TEXT,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- Page SEO metadata
CREATE TABLE IF NOT EXISTS page_seo (
  page_slug TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies --

-- Site settings: public read, no public write
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Service role can manage settings" ON site_settings USING (auth.role() = 'service_role');

-- Gallery categories: public read
ALTER TABLE gallery_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read categories" ON gallery_categories FOR SELECT USING (true);
CREATE POLICY "Service role manages categories" ON gallery_categories USING (auth.role() = 'service_role');

-- Gallery images: public can only read public images
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads public images" ON gallery_images FOR SELECT USING (is_public = true);
CREATE POLICY "Service role manages all images" ON gallery_images USING (auth.role() = 'service_role');

-- Authenticated admins can manage images
CREATE POLICY "Authenticated users manage images" ON gallery_images
  FOR ALL USING (auth.role() = 'authenticated');

-- Social profiles: public reads visible profiles
ALTER TABLE social_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads visible profiles" ON social_profiles FOR SELECT USING (is_visible = true);
CREATE POLICY "Authenticated users manage profiles" ON social_profiles FOR ALL USING (auth.role() = 'authenticated');

-- Contact submissions: only service role reads
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages submissions" ON contact_submissions USING (auth.role() = 'service_role');
CREATE POLICY "Anyone can insert" ON contact_submissions FOR INSERT WITH CHECK (true);

-- Authenticated users read submissions
CREATE POLICY "Authenticated reads submissions" ON contact_submissions FOR SELECT USING (auth.role() = 'authenticated');

-- Page SEO: public read
ALTER TABLE page_seo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads page seo" ON page_seo FOR SELECT USING (true);
CREATE POLICY "Authenticated manages page seo" ON page_seo FOR ALL USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_images_public ON gallery_images(is_public, sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_images_slug ON gallery_images(slug);
CREATE INDEX IF NOT EXISTS idx_gallery_images_category ON gallery_images(category_id);
CREATE INDEX IF NOT EXISTS idx_social_profiles_visible ON social_profiles(is_visible, sort_order);

-- Default site settings
INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'Alex Morgan Portfolio'),
  ('tagline', 'Creative Developer & Digital Artist'),
  ('bio', 'Hi, I''m Alex Morgan — a passionate creative developer and digital artist crafting immersive digital experiences. I blend code and creativity to build things that are both functional and beautiful.'),
  ('contact_email', 'hello@alexmorgan.dev'),
  ('seo_title', 'Alex Morgan — Creative Developer & Digital Artist'),
  ('seo_description', 'Personal portfolio of Alex Morgan — creative developer, digital artist, and experience designer. Explore projects, gallery, and connect.')
ON CONFLICT (key) DO NOTHING;

-- Default gallery categories
INSERT INTO gallery_categories (name, slug, sort_order) VALUES
  ('All', 'all', 0),
  ('Photography', 'photography', 1),
  ('Digital Art', 'digital-art', 2),
  ('Travel', 'travel', 3),
  ('Projects', 'projects', 4)
ON CONFLICT (slug) DO NOTHING;

-- Default social profiles
INSERT INTO social_profiles (platform, display_label, profile_url, icon_name, sort_order) VALUES
  ('GitHub', 'GitHub', 'https://github.com', 'Github', 1),
  ('LinkedIn', 'LinkedIn', 'https://linkedin.com', 'Linkedin', 2),
  ('Instagram', 'Instagram', 'https://instagram.com', 'Instagram', 3),
  ('X', 'X / Twitter', 'https://x.com', 'Twitter', 4),
  ('YouTube', 'YouTube', 'https://youtube.com', 'Youtube', 5),
  ('TikTok', 'TikTok', 'https://tiktok.com', 'Music', 6),
  ('Facebook', 'Facebook', 'https://facebook.com', 'Facebook', 7),
  ('Telegram', 'Telegram', 'https://t.me', 'Send', 8),
  ('WhatsApp', 'WhatsApp', 'https://wa.me', 'MessageCircle', 9),
  ('Email', 'Email', 'mailto:hello@alexmorgan.dev', 'Mail', 10)
ON CONFLICT DO NOTHING;
