-- Seed initial data for SMART method

-- Insert default criteria
INSERT INTO criteria (name, weight, type) VALUES
('Disiplin', 4, 'benefit'),
('Komunikasi', 5, 'benefit'),
('Komitmen', 4, 'benefit'),
('Kinerja', 5, 'benefit'),
('Pengalaman', 3, 'benefit')
ON CONFLICT DO NOTHING;

-- Insert sample candidates
INSERT INTO candidates (name) VALUES
('Rehan'),
('Alex'),
('Bastian'),
('Diana')
ON CONFLICT DO NOTHING;

-- Insert sample scores (this would typically be done through the UI)
-- Note: In a real application, you'd get the actual UUIDs from the inserted records
WITH candidate_criteria AS (
  SELECT c.id as candidate_id, cr.id as criteria_id, c.name as candidate_name, cr.name as criteria_name
  FROM candidates c
  CROSS JOIN criteria cr
)
INSERT INTO scores (candidate_id, criteria_id, score)
SELECT 
  candidate_id,
  criteria_id,
  CASE 
    WHEN candidate_name = 'Rehan' AND criteria_name = 'Disiplin' THEN 85
    WHEN candidate_name = 'Rehan' AND criteria_name = 'Komunikasi' THEN 90
    WHEN candidate_name = 'Rehan' AND criteria_name = 'Komitmen' THEN 80
    WHEN candidate_name = 'Rehan' AND criteria_name = 'Kinerja' THEN 88
    WHEN candidate_name = 'Rehan' AND criteria_name = 'Pengalaman' THEN 75
    WHEN candidate_name = 'Alex' AND criteria_name = 'Disiplin' THEN 78
    WHEN candidate_name = 'Alex' AND criteria_name = 'Komunikasi' THEN 85
    WHEN candidate_name = 'Alex' AND criteria_name = 'Komitmen' THEN 92
    WHEN candidate_name = 'Alex' AND criteria_name = 'Kinerja' THEN 85
    WHEN candidate_name = 'Alex' AND criteria_name = 'Pengalaman' THEN 82
    WHEN candidate_name = 'Bastian' AND criteria_name = 'Disiplin' THEN 92
    WHEN candidate_name = 'Bastian' AND criteria_name = 'Komunikasi' THEN 88
    WHEN candidate_name = 'Bastian' AND criteria_name = 'Komitmen' THEN 85
    WHEN candidate_name = 'Bastian' AND criteria_name = 'Kinerja' THEN 90
    WHEN candidate_name = 'Bastian' AND criteria_name = 'Pengalaman' THEN 88
    WHEN candidate_name = 'Diana' AND criteria_name = 'Disiplin' THEN 88
    WHEN candidate_name = 'Diana' AND criteria_name = 'Komunikasi' THEN 92
    WHEN candidate_name = 'Diana' AND criteria_name = 'Komitmen' THEN 88
    WHEN candidate_name = 'Diana' AND criteria_name = 'Kinerja' THEN 85
    WHEN candidate_name = 'Diana' AND criteria_name = 'Pengalaman' THEN 80
    ELSE 75
  END
FROM candidate_criteria
ON CONFLICT (candidate_id, criteria_id) DO NOTHING;
