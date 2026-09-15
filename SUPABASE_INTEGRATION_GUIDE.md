# Supabase Integration Guide

## Setup Steps

### 1. Environment Configuration
1. Copy your Supabase project URL and anon key from your Supabase dashboard
2. Update the `.env` file:
```env
EXPO_PUBLIC_SUPABASE_URL=your-project-url-here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Database Schema Setup
Run these SQL files in your Supabase SQL editor in order:

1. **complete_supabase_schema.sql** - Creates the main database structure
2. **withdrawal_enhancements.sql** - Adds withdrawal system enhancements  
3. **real_balance_system.sql** - Implements real balance tracking and user categorization

### 3. Switch to Supabase Context
Update your main App.js to use the Supabase context instead of mock context:

```javascript
// Replace this import:
import { UserProvider } from './src/context/UserContext';

// With this:
import { UserProvider } from './src/context/SupabaseUserContext';
```

### 4. Key Features Implemented

#### Real Balance System
- Tracks actual money flow for each user
- Categories: Rich (70%+), Middle Class (50-70%), Poor (20-50%), Broke (<20%)
- Automatic referral payouts when users register/upgrade
- Admin restrictions system for users with negative balances

#### Wallet Separation
- **Recharge Wallet**: Top-ups for upgrades only
- **Income Wallet**: Task earnings for withdrawals, spins, investments

#### Enhanced Withdrawal System
- Detailed withdrawal requests with admin approval
- Real balance validation before approval
- Multiple payment methods (M-Pesa, Bank, etc.)

### 5. Database Tables Overview

#### Core Tables
- `users` - User profiles with wallet balances and real balance tracking
- `levels` - User level definitions and costs
- `transactions` - All financial transactions
- `real_balance_transactions` - Audit trail for real balance changes

#### Feature Tables
- `investments` - User investment tracking
- `withdrawal_requests` - Withdrawal requests awaiting approval
- `referrals` - Referral relationships and bonuses
- `spin_attempts` - Spin wheel game history
- `gift_codes` - Gift code system
- `notifications` - In-app notifications

#### Admin Views
- `admin_user_real_balance` - User categories and real balances
- `admin_withdrawal_requests_with_balance` - Withdrawal requests with balance info
- `admin_users_overview` - Complete user overview for admin panel

### 6. Real Balance Calculations

#### When Real Balance Increases:
- User deposits/recharges money
- User receives referral bonuses
- User redeems gift codes
- User receives task earnings

#### When Real Balance Decreases:
- Referral payouts to uplines (4% level 1, 2% level 2, 0.25% level 3)
- Approved withdrawals
- System fees and penalties

#### User Categories:
- **Rich**: Real balance ≥ 70% of level investment
- **Middle Class**: Real balance 50-70% of level investment  
- **Poor**: Real balance 20-50% of level investment
- **Broke**: Real balance < 20% of level investment

### 7. Admin Functions

#### User Management
```sql
-- Apply restriction to user
SELECT apply_user_restriction('user-id', 'withdrawal', 24, 'Negative balance');

-- Check if user can perform action
SELECT check_user_restrictions('user-id', 'withdrawal');

-- Update real balance manually
SELECT update_real_balance('user-id', 100.00, 'admin_adjustment', 'Manual balance correction');
```

#### Withdrawal Management
```sql
-- View pending withdrawals with real balance status
SELECT * FROM admin_withdrawal_requests_with_balance WHERE status = 'pending';

-- Approve withdrawal (deducts from real balance)
UPDATE withdrawal_requests SET status = 'approved' WHERE id = 'request-id';
```

### 8. Testing Checklist

- [ ] User registration creates real balance entry
- [ ] Deposits increase recharge wallet and real balance
- [ ] Upgrades deduct from recharge wallet and trigger referral payouts
- [ ] Task completion adds to income wallet
- [ ] Withdrawals deduct from income wallet (after approval from real balance)
- [ ] Spin wheel uses income wallet for bets and payouts
- [ ] Investments use income wallet
- [ ] User categories update automatically based on real balance
- [ ] Admin can view all balances and apply restrictions

### 9. Security Notes

- RLS (Row Level Security) is enabled on all tables
- Users can only access their own data
- Admin functions require service role key
- Real balance is hidden from frontend users
- All financial transactions are logged for audit

### 10. Troubleshooting

#### Common Issues:
1. **Environment variables not loading**: Restart Expo dev server after updating .env
2. **Database connection errors**: Check Supabase URL and anon key
3. **Table not found errors**: Ensure all SQL files have been run in correct order
4. **RLS policy errors**: Check user authentication status

#### Debug Queries:
```sql
-- Check user's real balance and category
SELECT name, real_balance, user_category, level_investment 
FROM users WHERE email = 'user@example.com';

-- View recent real balance transactions
SELECT * FROM real_balance_transactions 
WHERE user_id = 'user-id' 
ORDER BY created_at DESC LIMIT 10;

-- Check withdrawal request status
SELECT wr.*, u.real_balance 
FROM withdrawal_requests wr 
JOIN users u ON wr.user_id = u.id 
WHERE wr.user_id = 'user-id';
```
