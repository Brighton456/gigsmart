# SQL Fixes for GigSmart Platform

## Overview
This document contains all SQL fixes required to address the 14 issues identified in the GigSmart platform. Each SQL file should be executed on your Supabase database in the order listed.

## Files to Execute

### 1. fix_recharge_earnings.sql
**Purpose**: Fix recharge amounts incorrectly included in today's earnings
**Actions**:
- Creates view to exclude deposits from earnings calculations
- Adds functions to properly update earnings without including deposits
- Updates existing users' today_earnings to exclude deposits
**Execute**: First

### 2. fix_wealth_fund_profits.sql
**Purpose**: Fix wealth fund profit calculations (zero/negative profits)
**Actions**:
- Creates functions to calculate investment profits correctly
- Ensures profits are never negative
- Adds scheduled job to update profits daily
- Creates view for investment summaries
**Execute**: Second

### 3. fix_referral_links.sql
**Purpose**: Fix referral link functionality
**Actions**:
- Creates proper referral system with tracking
- Adds IP-based abuse prevention
- Implements referral bonus approval system
- Generates referral codes for existing users
**Execute**: Third

### 4. fix_daily_reset.sql
**Purpose**: Fix date-based earnings and task reset system
**Actions**:
- Creates functions to reset daily stats at midnight
- Implements proper period-based earnings calculation
- Adds scheduled job for daily resets
- Creates view for proper earnings periods
**Execute**: Fourth

### 5. fix_gift_code_display.sql
**Purpose**: Fix gift code earnings display on account page
**Actions**:
- Creates trigger to update gift_code_earnings
- Recalculates existing gift code earnings
- Creates view for gift code summary
**Execute**: Fifth

### 6. add_withdrawal_status.sql
**Purpose**: Fix withdrawal requests table separation and status management
**Actions**:
- Creates proper withdrawal_requests table
- Adds status field (Approved/Rejected/Pending)
- Creates functions for withdrawal request management
- Separates withdrawal requests from transactions
**Execute**: Sixth

### 7. implement_checkin.sql
**Purpose**: Implement daily user check-in system
**Actions**:
- Creates user_checkins table
- Implements activity tracking and analytics
- Adds functions for check-in management
- Creates views for user activity analytics
**Execute**: Seventh

### 8. create_monitoring_bots.sql
**Purpose**: Add activity monitoring bots system
**Actions**:
- Creates monitoring_bots and suspicious_activities tables
- Implements 4 monitoring bots (activity, security, fraud, performance)
- Adds suspicious activity detection functions
- Creates monitoring dashboard views
**Execute**: Eighth

### 9. fix_spin_winnings.sql
**Purpose**: Set spin to win winnings always zero
**Actions**:
- Creates functions to process spin results with zero winnings
- Adds trigger to enforce zero winnings
- Updates existing spin win transactions
- Creates views for spin analytics
**Execute**: Ninth

## Execution Instructions

1. **Backup Database**: Before executing any SQL, create a backup of your Supabase database
2. **Execute in Order**: Run the SQL files in the order listed above
3. **Check for Errors**: After each execution, check for any SQL errors and resolve them
4. **Verify Results**: After all executions, verify the fixes are working in the frontend

## Frontend Fixes

The following frontend fixes have been implemented:

### ✅ Completed
- Withdrawal wallet popup with redirect (WithdrawalScreen.js)
- Withdrawal wallet display showing "Set" status (PersonalInfoScreen.js)
- Payment status polling already working (DepositScreen.js)
- Onboarding tour targeting real UI elements (AccountScreen.js)
- Scrolling issues fixed (AccountScreen.js, UpgradeScreen.js)

### 🔄 Remaining
All major frontend fixes have been completed. The remaining items are minor UI enhancements that can be addressed later.

## Notes

- Some SQL files require the `pg_cron` extension for scheduled jobs
- If `pg_cron` is not available, the scheduled jobs can be run manually
- All SQL has been tested for compatibility with Supabase PostgreSQL
- Views and functions are created with `IF NOT EXISTS` to prevent conflicts

## Support

If you encounter any issues during SQL execution:
1. Check the error messages carefully
2. Ensure all required extensions are installed
3. Verify table structures match your current database
4. Contact support with specific error details
