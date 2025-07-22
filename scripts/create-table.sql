-- Create tables for SMART method calculation

-- Criteria table
CREATE TABLE IF NOT EXISTS criteria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  weight INTEGER NOT NULL CHECK (weight >= 1 AND weight <= 5),
  type VARCHAR(10) NOT NULL CHECK (type IN ('benefit', 'cost')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scores table (junction table for candidate-criteria scores)
CREATE TABLE IF NOT EXISTS scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  criteria_id UUID REFERENCES criteria(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(candidate_id, criteria_id)
);

-- Calculation results table
CREATE TABLE IF NOT EXISTS calculation_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  utility_score DECIMAL(5,2) NOT NULL,
  rank INTEGER NOT NULL,
  calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scores_candidate_id ON scores(candidate_id);
CREATE INDEX IF NOT EXISTS idx_scores_criteria_id ON scores(criteria_id);
CREATE INDEX IF NOT EXISTS idx_calculation_results_candidate_id ON calculation_results(candidate_id);
CREATE INDEX IF NOT EXISTS idx_calculation_results_rank ON calculation_results(rank);
