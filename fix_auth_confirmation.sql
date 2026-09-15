-- Fix for users with unconfirmed emails
-- This will manually confirm users who registered but never confirmed their email

-- Option 1: Manually confirm specific users (replace with actual user IDs)
-- UPDATE auth.users 
-- SET 
--     email_confirmed_at = NOW(),
--     confirmed_at = NOW()
-- WHERE id IN (
--     'user-id-1',
--     'user-id-2'
-- ) AND (email_confirmed_at IS NULL OR confirmed_at IS NULL);

-- Option 2: Confirm all unconfirmed users (use with caution)
UPDATE auth.users 
SET 
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    confirmed_at = COALESCE(confirmed_at, NOW())
WHERE email_confirmed_at IS NULL OR confirmed_at IS NULL;

-- Option 3: Create a function to auto-confirm new signups
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-confirm users on signup (disable email verification)
    NEW.email_confirmed_at = NOW();
    NEW.confirmed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-confirm (optional - only if you want to disable email verification)
-- DROP TRIGGER IF EXISTS trigger_auto_confirm_user ON auth.users;
-- CREATE TRIGGER trigger_auto_confirm_user
--     BEFORE INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION auto_confirm_user();
