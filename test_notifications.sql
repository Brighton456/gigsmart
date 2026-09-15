-- Test notification data for Supabase
-- Insert some test notifications to verify the system works

INSERT INTO notifications (
  id,
  title,
  message,
  type,
  page_name,
  status,
  priority,
  apply_to_levels,
  created_at,
  expires_at
) VALUES 
(
  gen_random_uuid(),
  'Welcome to GigSmart!',
  'Start completing tasks to earn money immediately. Check out our task section!',
  'info',
  'home',
  true,
  1,
  ARRAY[1, 2, 3, 4, 5],
  NOW(),
  NOW() + INTERVAL '30 days'
),
(
  gen_random_uuid(),
  'Task Limit Reached',
  'You have completed all available tasks for today. Come back tomorrow for more!',
  'warning',
  'tasks',
  true,
  2,
  ARRAY[1, 2, 3, 4, 5],
  NOW(),
  NOW() + INTERVAL '1 day'
),
(
  gen_random_uuid(),
  'Upgrade Available',
  'Upgrade to the next level to increase your earning potential and unlock new features!',
  'success',
  'upgrade',
  true,
  1,
  ARRAY[1, 2],
  NOW(),
  NOW() + INTERVAL '7 days'
),
(
  gen_random_uuid(),
  'Investment Returns',
  'Your investments are performing well. Check your wealth fund for details!',
  'info',
  'wealth',
  true,
  2,
  ARRAY[3, 4, 5],
  NOW(),
  NOW() + INTERVAL '14 days'
),
(
  gen_random_uuid(),
  'New Referral Bonus!',
  'Someone joined using your referral link. You earned a commission!',
  'success',
  'team',
  true,
  1,
  ARRAY[2, 3, 4, 5],
  NOW(),
  NOW() + INTERVAL '3 days'
);

-- Verify the notifications were inserted
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
