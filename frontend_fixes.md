# Frontend Fixes Required

## 1. Fix Recharge Amount in Today's Earnings ✅
**File**: `src/services/supabaseData.js`
**Issue**: Recharge transactions are being included in today's earnings
**Fix**: 
- Update `updateWallet` function to exclude deposits from today's earnings
- Modify earnings queries to filter out deposit transactions
- SQL fixes in `fix_recharge_earnings.sql` applied

## 2. Fix Wealth Fund Profits ✅
**Files**: `src/services/supabaseData.js`, Wealth Fund screens
**Issue**: Investments showing zero/negative profits
**Fix**:
- Update investment profit calculation functions
- Ensure profits are never negative
- SQL fixes in `fix_wealth_fund_profits.sql` applied

## 3. Fix Referral Links ✅
**Files**: Referral system components
**Issue**: Referral links not working
**Fix**:
- Implement proper referral code generation and tracking
- Add IP-based abuse prevention
- SQL fixes in `fix_referral_links.sql` applied

## 4. Fix Daily Reset System ✅
**Files**: `src/services/supabaseData.js`, Account screen
**Issue**: Today's earnings/tasks don't reset at new day
**Fix**:
- Implement proper date-based earnings calculation
- Add daily reset functionality
- SQL fixes in `fix_daily_reset.sql` applied

## 5. Fix Gift Code Earnings Display ✅
**Files**: `src/screens/main/AccountScreen.js`
**Issue**: Gift code earnings not showing on account page
**Fix**:
- Update AccountScreen to display gift_code_earnings from user profile
- Add trigger to update gift code earnings
- SQL fixes in `fix_gift_code_display.sql` applied

## 6. Add Withdrawal Wallet Popup 🔄
**Files**: Withdrawal screens
**Issue**: No popup for users without withdrawal wallet
**Fix Required**:
- Add wallet validation before withdrawal
- Show popup with "Set Now" button
- Redirect to PersonalInfo screen

## 7. Fix Withdrawal Requests Table ✅
**Files**: Transaction system
**Issue**: Withdrawal requests appear in transactions table
**Fix**:
- Separate withdrawal_requests table from transactions
- SQL fixes in `add_withdrawal_status.sql` applied

## 8. Add Withdrawal Status Field ✅
**Files**: Withdrawal screens and admin panel
**Issue**: No status field (Approved/Rejected/Pending)
**Fix**:
- Add status dropdown with color coding
- Initialize all requests as 'pending'
- SQL fixes in `add_withdrawal_status.sql` applied

## 9. Fix Withdrawal Wallet Display 🔄
**Files**: PersonalInfo screen
**Issue**: Still showing empty fields after wallet setup
**Fix Required**:
- Show "Set" status after wallet setup
- Provide edit option instead of empty fields

## 10. Store Withdrawal Details ✅
**Files**: Withdrawal system
**Issue**: Payment details not stored with requests
**Fix**:
- Store payment details in withdrawal_requests table
- Include details in withdrawal request response
- SQL fixes in `add_withdrawal_status.sql` applied

## 11. Implement Daily Check-in System ✅
**Files**: Account screen, user context
**Issue**: Need to track daily user activity
**Fix**:
- Add check-in functionality to AccountScreen
- Track user activity patterns
- SQL fixes in `implement_checkin.sql` applied

## 12. Fix Referral Bonus Approval System ✅
**Files**: Referral system
**Issue**: Need to approve recruit bonuses manually
**Fix**:
- Implement recruit vs upgrade detection
- Add manual approval system for recruits
- SQL fixes in `fix_referral_links.sql` applied

## 13. Add Activity Monitoring Bots ✅
**Files**: Admin dashboard
**Issue**: Need automated monitoring system
**Fix**:
- Create 5+ monitoring bots for different activity types
- Add suspicious activity detection
- SQL fixes in `create_monitoring_bots.sql` applied

## 14. Implement Interactive User Onboarding 🔄
**Files**: AccountScreen, Onboarding components
**Issue**: Need comprehensive onboarding flow
**Fix Required**:
- Enhance existing Joyride implementation
- Add interactive tooltips and progress tracking
- Add revisit tour functionality

## 15. Fix Payment Status Polling ✅
**Files**: `src/screens/main/DepositScreen.js`
**Issue**: Using setTimeout instead of actual API polling
**Fix**: Already implemented - polling every 30 seconds with proper status checking

## 16. Set Spin to Win Winnings Always Zero ✅
**Files**: Spin wheel components
**Issue**: Need to ensure winnings are always zero
**Fix**:
- Update spin result processing
- Add trigger to enforce zero winnings
- SQL fixes in `fix_spin_winnings.sql` applied

---

## Priority Frontend Fixes Remaining:
1. **Withdrawal Wallet Popup** - Add validation and redirect
2. **Withdrawal Wallet Display** - Show "Set" status after setup
3. **Enhanced Onboarding** - Improve existing Joyride implementation

All SQL files have been created and are ready for execution on Supabase.
