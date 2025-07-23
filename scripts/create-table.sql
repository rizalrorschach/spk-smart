-- Create tables for SMART method calculation with user isolation

-- Criteria table
CREATE TABLE IF NOT EXISTS criteria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  weight INTEGER NOT NULL CHECK (weight >= 1 AND weight <= 5),
  type VARCHAR(10) NOT NULL CHECK (type IN ('benefit', 'cost')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scores table (junction table for candidate-criteria scores)
CREATE TABLE IF NOT EXISTS scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  criteria_id UUID REFERENCES criteria(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, candidate_id, criteria_id)
);

-- Calculation results table
CREATE TABLE IF NOT EXISTS calculation_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  utility_score DECIMAL(5,2) NOT NULL,
  rank INTEGER NOT NULL,
  calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  group_id UUID NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_criteria_user_id ON criteria(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_candidate_id ON scores(candidate_id);
CREATE INDEX IF NOT EXISTS idx_scores_criteria_id ON scores(criteria_id);
CREATE INDEX IF NOT EXISTS idx_calculation_results_user_id ON calculation_results(user_id);
CREATE INDEX IF NOT EXISTS idx_calculation_results_candidate_id ON calculation_results(candidate_id);
CREATE INDEX IF NOT EXISTS idx_calculation_results_rank ON calculation_results(rank);
CREATE INDEX IF NOT EXISTS idx_calculation_results_group_id ON calculation_results(group_id);

-- Enable Row Level Security (RLS)
ALTER TABLE criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculation_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to ensure users can only access their own data
CREATE POLICY "Users can only access their own criteria" ON criteria
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own candidates" ON candidates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own scores" ON scores
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own calculation results" ON calculation_results
  FOR ALL USING (auth.uid() = user_id);
