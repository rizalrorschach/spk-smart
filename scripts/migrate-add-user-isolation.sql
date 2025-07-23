-- Migration script to add user isolation to existing tables
-- Run this script to add user_id columns and enable Row Level Security

-- Add user_id columns to existing tables
ALTER TABLE criteria ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE scores ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE calculation_results ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE calculation_results ADD COLUMN IF NOT EXISTS group_id UUID;

-- Update existing data to assign to the first user (temporary - you might want to handle this differently)
-- WARNING: This will assign all existing data to the first user in the system
-- You may want to delete existing data instead or handle this migration differently
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first user ID
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    
    -- Only update if we found a user and if user_id columns are null
    IF first_user_id IS NOT NULL THEN
        UPDATE criteria SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE candidates SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE scores SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE calculation_results SET user_id = first_user_id WHERE user_id IS NULL;
        -- Generate group_ids for existing calculation results
        UPDATE calculation_results SET group_id = gen_random_uuid() WHERE group_id IS NULL;
    END IF;
END $$;

-- Make user_id columns NOT NULL after data migration
ALTER TABLE criteria ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE candidates ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE scores ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE calculation_results ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE calculation_results ALTER COLUMN group_id SET NOT NULL;

-- Update unique constraint for scores to include user_id
ALTER TABLE scores DROP CONSTRAINT IF EXISTS scores_candidate_id_criteria_id_key;
ALTER TABLE scores ADD CONSTRAINT scores_user_candidate_criteria_unique UNIQUE(user_id, candidate_id, criteria_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_criteria_user_id ON criteria(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_calculation_results_user_id ON calculation_results(user_id);
CREATE INDEX IF NOT EXISTS idx_calculation_results_group_id ON calculation_results(group_id);

-- Enable Row Level Security (RLS)
ALTER TABLE criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculation_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can only access their own criteria" ON criteria;
DROP POLICY IF EXISTS "Users can only access their own candidates" ON candidates;
DROP POLICY IF EXISTS "Users can only access their own scores" ON scores;
DROP POLICY IF EXISTS "Users can only access their own calculation results" ON calculation_results;

-- Create RLS policies to ensure users can only access their own data
CREATE POLICY "Users can only access their own criteria" ON criteria
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own candidates" ON candidates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own scores" ON scores
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own calculation results" ON calculation_results
  FOR ALL USING (auth.uid() = user_id); 