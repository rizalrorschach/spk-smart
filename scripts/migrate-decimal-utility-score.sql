-- Migration to change utility_score from percentage format to decimal format
-- This changes DECIMAL(5,2) to DECIMAL(6,4) to properly store values between 0-1

-- First, update existing data by dividing by 100 to convert percentages to decimals
UPDATE calculation_results 
SET utility_score = utility_score / 100.00
WHERE utility_score > 1.0;

-- Then alter the column to support more decimal places
ALTER TABLE calculation_results 
ALTER COLUMN utility_score TYPE DECIMAL(6,4);

-- Add a check constraint to ensure values are between 0 and 1
ALTER TABLE calculation_results
ADD CONSTRAINT check_utility_score_range CHECK (utility_score >= 0 AND utility_score <= 1); 