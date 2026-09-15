-- Add onboarding_complete column to users table
DO $$
BEGIN
    -- Check if column exists before adding
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'onboarding_complete'
    ) THEN
        ALTER TABLE users ADD COLUMN onboarding_complete BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added onboarding_complete column to users table';
    ELSE
        RAISE NOTICE 'onboarding_complete column already exists in users table';
    END IF;
END $$;

-- Also add has_seen_onboarding for backward compatibility
DO $$
BEGIN
    -- Check if column exists before adding
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'has_seen_onboarding'
    ) THEN
        ALTER TABLE users ADD COLUMN has_seen_onboarding BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added has_seen_onboarding column to users table';
    ELSE
        RAISE NOTICE 'has_seen_onboarding column already exists in users table';
    END IF;
END $$;
