
/*
  # Create AgriStack Farmers Table

  1. New Tables
    - `farmers`
      - `id` (uuid, primary key)
      - `name` (text, farmer's full name)
      - `email` (text, unique, for auth)
      - `location` (text, location name)
      - `address` (text, full address)
      - `crop_type` (text, type of crop)
      - `lat` (numeric, GPS latitude)
      - `lon` (numeric, GPS longitude)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `farmers` table
    - Authenticated users can read their own data
    - Authenticated users can insert their own data
    - Authenticated users can update their own data
*/

CREATE TABLE IF NOT EXISTS farmers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  location text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  crop_type text NOT NULL DEFAULT 'wheat',
  lat numeric(10, 7) DEFAULT 13.0827,
  lon numeric(10, 7) DEFAULT 80.2707,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own farmer profile"
  ON farmers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own farmer profile"
  ON farmers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own farmer profile"
  ON farmers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own farmer profile"
  ON farmers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
