/*
  # Add timetable table

  1. New Tables
    - `timetable`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `day` (text, day of week)
      - `period` (integer, period number)
      - `subject` (text, subject name)
      - `teacher` (text, teacher name)
      - `room` (text, room number/location)
      - `start_time` (text, start time)
      - `end_time` (text, end time)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `timetable` table
    - Add policies for authenticated users to manage their own timetable data

  3. Indexes
    - Add index on user_id for faster queries
    - Add composite index on user_id, day, period for unique constraints
*/

-- Create timetable table
CREATE TABLE IF NOT EXISTS timetable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  day text NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')),
  period integer NOT NULL CHECK (period >= 1 AND period <= 8),
  subject text NOT NULL DEFAULT '',
  teacher text NOT NULL DEFAULT '',
  room text NOT NULL DEFAULT '',
  start_time text NOT NULL DEFAULT '',
  end_time text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, day, period)
);

-- Add foreign key constraint
ALTER TABLE timetable 
ADD CONSTRAINT timetable_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own timetable"
  ON timetable
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timetable"
  ON timetable
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timetable"
  ON timetable
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timetable"
  ON timetable
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS timetable_user_id_idx ON timetable(user_id);
CREATE INDEX IF NOT EXISTS timetable_day_period_idx ON timetable(day, period);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_timetable_updated_at
  BEFORE UPDATE ON timetable
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();