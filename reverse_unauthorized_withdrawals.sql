-- SQL Script to Reverse Unauthorized Withdrawals (Feb 23-24, 2026)
-- Restores income_wallet balances and deletes withdrawal transaction records

BEGIN;

-- Step 1: Update income_wallet balances for affected users
-- February 23rd withdrawals
UPDATE users 
SET income_wallet = income_wallet + 70 
WHERE id = 'e7535691-e22f-4103-85bc-c9fb3e25da45'; -- franglinemufwinyi@gmail.com

UPDATE users 
SET income_wallet = income_wallet + 70 
WHERE id = '70fb06d2-8a7c-49ff-9047-1005cf4c1c03'; -- sayawyclife859@gmail.com

UPDATE users 
SET income_wallet = income_wallet + 470 
WHERE id = 'e842e715-7a12-476d-8c88-87497449b938'; -- odhiambofelixomondi65@gmail.com

UPDATE users 
SET income_wallet = income_wallet + 470 
WHERE id = '5eb293b7-8c80-4a85-bf01-7fabb6a02b4d'; -- michaelmumongumbi1@gmail.com

UPDATE users 
SET income_wallet = income_wallet + 470 
WHERE id = 'f574cab2-eeeb-46f6-a4f9-332aacc0b4a9'; -- stephennyamboha8@gmail.com

-- February 24th withdrawals
UPDATE users 
SET income_wallet = income_wallet + 70 
WHERE id = 'e7535691-e22f-4103-85bc-c9fb3e25da45'; -- franglinemufwinyi@gmail.com (second withdrawal)

UPDATE users 
SET income_wallet = income_wallet + 470 
WHERE id = '52ef2f75-cbbf-4ed2-b7f0-5b2fbb8435b1'; -- otienoedmonton5@gmail.com

-- Step 2: Delete withdrawal_requests first (foreign key constraint)
DELETE FROM withdrawal_requests 
WHERE transaction_id IN (
    '65d097c8-4987-46ec-80ec-fcd41797de0b', -- Feb 23 -70 withdrawal
    '086e1b97-b5a9-464b-8b9a-e1f0a574d540', -- Feb 23 -70 withdrawal
    '202d1d5f-3a8f-40b1-aa80-5897777618ad', -- Feb 23 -470 withdrawal
    '15f9b85d-c1f2-4ea9-804c-9ea48e428102', -- Feb 23 -470 withdrawal
    'b6af4978-d60f-4814-9a75-be5e3218386a', -- Feb 23 -470 withdrawal
    '1fa8ff5a-5d8a-4fb7-a26d-d3cb3dce5f8c', -- Feb 24 -70 withdrawal
    '60e1e535-f272-44e7-af1a-e5903a295b72'  -- Feb 24 -470 withdrawal
);

-- Step 3: Delete the withdrawal transaction records
DELETE FROM transactions 
WHERE id IN (
    '65d097c8-4987-46ec-80ec-fcd41797de0b', -- Feb 23 -70 withdrawal
    '086e1b97-b5a9-464b-8b9a-e1f0a574d540', -- Feb 23 -70 withdrawal
    '202d1d5f-3a8f-40b1-aa80-5897777618ad', -- Feb 23 -470 withdrawal
    '15f9b85d-c1f2-4ea9-804c-9ea48e428102', -- Feb 23 -470 withdrawal
    'b6af4978-d60f-4814-9a75-be5e3218386a', -- Feb 23 -470 withdrawal
    '1fa8ff5a-5d8a-4fb7-a26d-d3cb3dce5f8c', -- Feb 24 -70 withdrawal
    '60e1e535-f272-44e7-af1a-e5903a295b72'  -- Feb 24 -470 withdrawal
);

-- Step 4: Verify the results
SELECT 
    u.email,
    u.income_wallet as corrected_balance,
    u.income_wallet as expected_balance
FROM users u
WHERE u.id IN (
    'e7535691-e22f-4103-85bc-c9fb3e25da45',
    '70fb06d2-8a7c-49ff-9047-1005cf4c1c03',
    'e842e715-7a12-476d-8c88-87497449b938',
    '5eb293b7-8c80-4a85-bf01-7fabb6a02b4d',
    'f574cab2-eeeb-46f6-a4f9-332aacc0b4a9',
    '52ef2f75-cbbf-4ed2-b7f0-5b2fbb8435b1'
)
ORDER BY u.email;

COMMIT;

-- Summary:
-- Total reversed: 1620 KES
-- - 3 withdrawals of 470 = 1410 KES
-- - 3 withdrawals of 70 = 210 KES
-- Users affected: 6 users
-- Transactions deleted: 7 withdrawal records
