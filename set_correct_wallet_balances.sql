-- SQL Script to Set Correct Wallet Balances (Feb 23-24, 2026)
-- Sets income_wallet to the correct amounts after withdrawal reversal

BEGIN;

-- Set correct income_wallet balances for affected users
UPDATE users 
SET income_wallet = 450 
WHERE id = 'e7535691-e22f-4103-85bc-c9fb3e25da45'; -- franglinemufwinyi@gmail.com

UPDATE users 
SET income_wallet = 430 
WHERE id = '70fb06d2-8a7c-49ff-9047-1005cf4c1c03'; -- sayawyclife859@gmail.com

UPDATE users 
SET income_wallet = 840 
WHERE id = 'e842e715-7a12-476d-8c88-87497449b938'; -- odhiambofelixomondi65@gmail.com

UPDATE users 
SET income_wallet = 987 
WHERE id = '5eb293b7-8c80-4a85-bf01-7fabb6a02b4d'; -- michaelmumongumbi1@gmail.com

UPDATE users 
SET income_wallet = 740 
WHERE id = 'f574cab2-eeeb-46f6-a4f9-332aacc0b4a9'; -- stephennyamboha8@gmail.com

UPDATE users 
SET income_wallet = 513 
WHERE id = '52ef2f75-cbbf-4ed2-b7f0-5b2fbb8435b1'; -- otienoedmonton5@gmail.com

-- Verify the results
SELECT 
    u.email,
    u.income_wallet as corrected_balance
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
