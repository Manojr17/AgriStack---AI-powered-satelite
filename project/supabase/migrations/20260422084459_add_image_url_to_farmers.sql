/*
  # Add Profile Image Support to Farmers Table

  1. New Columns
    - `image_url` (text, nullable) - URL to farmer's profile image in storage

  2. Modifications
    - Add image_url column to existing farmers table
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farmers' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE farmers ADD COLUMN image_url text;
  END IF;
END $$;
