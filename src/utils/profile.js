export const normalizeProfile = (profile) => {
  if (!profile) {
    return null;
  }

  const toNumber = (value, fallback = 0) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return fallback;
    }
    return Number(value);
  };

  return {
    ...profile,
    isActive: profile.is_active ?? true,
    rechargeWallet: toNumber(profile.recharge_wallet),
    incomeWallet: toNumber(profile.income_wallet),
    depositWallet: toNumber(profile.deposit_wallet),
    mainWallet: toNumber(profile.main_wallet),
    wealthFundBalance: toNumber(profile.wealth_fund_balance),
    totalEarned: toNumber(profile.total_earnings),
    levelInvestment: toNumber(profile.level_investment),
    todayEarnings: toNumber(profile.today_earnings),
    weekEarnings: toNumber(profile.week_earnings),
    monthEarnings: toNumber(profile.month_earnings),
    yesterdayEarnings: toNumber(profile.yesterday_earnings),
    referralRebateTotal: toNumber(profile.referral_rebate_total),
    giftCodeEarnings: toNumber(profile.gift_code_earnings),
    totalWithdrawals: toNumber(profile.total_withdrawals),
    tasksCompletedToday: toNumber(profile.tasks_completed_today),
    currentLevelId: toNumber(profile.current_level ?? profile.currentLevelId, 0),
    withdrawalAccountType: profile.withdrawal_account_type || null,
    withdrawalAccountDetails: profile.withdrawal_account_details || null,
    withdrawalAccount: profile.withdrawal_account_details?.display || null,
    onboardingComplete: Boolean(
      profile.onboarding_complete ??
      profile.onboarding_complete ??
      profile.has_seen_onboarding ??
      false
    ),
    hasSeenOnboarding: Boolean(
      profile.has_seen_onboarding ??
      profile.onboarding_complete ??
      profile.hasSeenOnboarding ??
      false
    ),
  };
};
