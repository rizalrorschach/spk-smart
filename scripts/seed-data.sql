-- Seed initial data for SMART method with user isolation
-- Note: This script should be run after a user is created
-- Replace 'YOUR_USER_ID_HERE' with an actual user ID from auth.users

-- First, get or create a sample user ID (optional - for testing only)
-- You can replace this with a specific user ID
DO $$
DECLARE
    sample_user_id UUID;
BEGIN
    -- Try to get an existing user, or you can specify a user ID directly
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    
    -- Only insert sample data if we have a user
    IF sample_user_id IS NOT NULL THEN
        
        -- Insert default criteria with user association
        INSERT INTO criteria (user_id, name, weight, type) VALUES
        (sample_user_id, 'Disiplin', 4, 'benefit'),
        (sample_user_id, 'Komunikasi', 5, 'benefit'),
        (sample_user_id, 'Komitmen', 4, 'benefit'),
        (sample_user_id, 'Kinerja', 5, 'benefit'),
        (sample_user_id, 'Pengalaman', 3, 'benefit')
        ON CONFLICT DO NOTHING;

        -- Insert sample candidates with user association
        INSERT INTO candidates (user_id, name) VALUES
        (sample_user_id, 'Rehan'),
        (sample_user_id, 'Alex'),
        (sample_user_id, 'Bastian'),
        (sample_user_id, 'Diana')
        ON CONFLICT DO NOTHING;

        -- Insert sample scores with user association
        -- Note: In a real application, you'd get the actual UUIDs from the inserted records
        WITH candidate_criteria AS (
          SELECT c.id as candidate_id, cr.id as criteria_id, c.name as candidate_name, cr.name as criteria_name, sample_user_id as user_id
          FROM candidates c
          CROSS JOIN criteria cr
          WHERE c.user_id = sample_user_id AND cr.user_id = sample_user_id
        )
        INSERT INTO scores (user_id, candidate_id, criteria_id, score)
        SELECT 
          user_id,
          candidate_id, 
          criteria_id, 
          CASE 
            WHEN candidate_name = 'Rehan' AND criteria_name = 'Disiplin' THEN 85
            WHEN candidate_name = 'Rehan' AND criteria_name = 'Komunikasi' THEN 90
            WHEN candidate_name = 'Rehan' AND criteria_name = 'Komitmen' THEN 88
            WHEN candidate_name = 'Rehan' AND criteria_name = 'Kinerja' THEN 92
            WHEN candidate_name = 'Rehan' AND criteria_name = 'Pengalaman' THEN 75
            
            WHEN candidate_name = 'Alex' AND criteria_name = 'Disiplin' THEN 78
            WHEN candidate_name = 'Alex' AND criteria_name = 'Komunikasi' THEN 85
            WHEN candidate_name = 'Alex' AND criteria_name = 'Komitmen' THEN 82
            WHEN candidate_name = 'Alex' AND criteria_name = 'Kinerja' THEN 88
            WHEN candidate_name = 'Alex' AND criteria_name = 'Pengalaman' THEN 80
            
            WHEN candidate_name = 'Bastian' AND criteria_name = 'Disiplin' THEN 90
            WHEN candidate_name = 'Bastian' AND criteria_name = 'Komunikasi' THEN 88
            WHEN candidate_name = 'Bastian' AND criteria_name = 'Komitmen' THEN 92
            WHEN candidate_name = 'Bastian' AND criteria_name = 'Kinerja' THEN 85
            WHEN candidate_name = 'Bastian' AND criteria_name = 'Pengalaman' THEN 85
            
            WHEN candidate_name = 'Diana' AND criteria_name = 'Disiplin' THEN 95
            WHEN candidate_name = 'Diana' AND criteria_name = 'Komunikasi' THEN 92
            WHEN candidate_name = 'Diana' AND criteria_name = 'Komitmen' THEN 90
            WHEN candidate_name = 'Diana' AND criteria_name = 'Kinerja' THEN 88
            WHEN candidate_name = 'Diana' AND criteria_name = 'Pengalaman' THEN 82
            ELSE 75
          END as score
        FROM candidate_criteria
        ON CONFLICT (user_id, candidate_id, criteria_id) DO NOTHING;

        RAISE NOTICE 'Sample data created successfully for user: %', sample_user_id;
    ELSE
        RAISE NOTICE 'No users found. Please create a user first before running seed data.';
    END IF;
END $$;
