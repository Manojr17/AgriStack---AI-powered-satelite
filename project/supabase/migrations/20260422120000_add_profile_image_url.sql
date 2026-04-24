/*
  # Add profile_image_url column to farmers table

  Ensures the profile_image_url column exists for storing
  the public URL of the farmer's uploaded profile photo.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farmers' AND column_name = 'profile_image_url'
  ) THEN
    ALTER TABLE farmers ADD COLUMN profile_image_url text;
  END IF;
END $$;

-- Also add update policy if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'farmers' AND policyname = 'Users can update own farmer profile'
  ) THEN
    CREATE POLICY "Users can update own farmer profile"
      ON farmers FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
