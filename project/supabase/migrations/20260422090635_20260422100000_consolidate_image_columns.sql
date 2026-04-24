
/*
  # Consolidate Image Columns and Setup Storage

  1. Changes
    - Remove duplicate `image_url` column (use `profile_image_url` instead)
    - Remove `profile_image_data` bytea column (will use Supabase Storage instead)
    - Keep single `profile_image_url` column for image storage

  2. Storage
    - Create a storage bucket for profile images
    - Set up RLS policies for the bucket

  3. Security
    - Users can only upload/delete their own profile images
    - Profile images are publicly readable for display
*/

-- Remove duplicate columns
ALTER TABLE farmers DROP COLUMN IF EXISTS image_url;
ALTER TABLE farmers DROP COLUMN IF EXISTS profile_image_data;

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage
-- Allow public read access to profile images
CREATE POLICY "Public can view profile images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-images');

-- Allow authenticated users to upload their own profile images
CREATE POLICY "Users can upload own profile image"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to update their own profile images
CREATE POLICY "Users can update own profile image"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to delete their own profile images
CREATE POLICY "Users can delete own profile image"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
