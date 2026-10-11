-- Storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Public read policy for gallery bucket
CREATE POLICY "Public can view gallery images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

-- Authenticated users can upload
CREATE POLICY "Authenticated can upload gallery images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');

-- Authenticated users can update their uploads
CREATE POLICY "Authenticated can update gallery images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');

-- Authenticated users can delete
CREATE POLICY "Authenticated can delete gallery images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');
