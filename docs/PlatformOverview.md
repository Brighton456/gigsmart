# Platform Overview

## Table of Contents
- [Platform Summary](#platform-summary)
- [Navigation Architecture](#navigation-architecture)
- [Authentication Flow](#authentication-flow)
- [Home Stack](#home-stack)
- [Task Stack](#task-stack)
- [Upgrade Stack](#upgrade-stack)
- [Team Stack](#team-stack)
- [Account Stack](#account-stack)
- [Financial Operations](#financial-operations)
- [Investment & Wealth Features](#investment--wealth-features)
- [Gamification & Engagement](#gamification--engagement)
- [Support & Help Resources](#support--help-resources)
- [State Management & Contexts](#state-management--contexts)
- [UI Components & Styling](#ui-components--styling)
- [Notifications & Feedback](#notifications--feedback)
- [Appendix: Key Data References](#appendix-key-data-references)

## Platform Summary
- **Purpose** A React Native + Expo mobile platform that rewards users for completing daily app-install tasks, managing investments, and growing referral teams.
- **Core Modules** Authentication, animated dashboard, task marketplace, level upgrades, finance operations, team building, help center.
- **Technology** React Navigation stacks and tabs, Expo Linear Gradient, Ionicons, bespoke theming from `src/constants/theme.js` and `src/constants/branding.js`.

## Navigation Architecture
- **Main Navigator** (`src/navigation/MainNavigator.js`) organizes five bottom tabs: `Home`, `Task`, `Upgrade`, `Team`, `Account`, each backed by its own stack navigator.
- **Stack Composition**
  - **Home Stack** Screens: `HomeScreen`, `WealthFundScreen`, `RedeemGiftsScreen`, `HelpBookScreen`.
  - **Task Stack** Screens: `TaskScreen`.
  - **Upgrade Stack** Screens: `UpgradeScreen`, `UpgradeDetailScreen`.
  - **Team Stack** Screens: `TeamScreen`, `ReferralScreen`.
  - **Account Stack** Screens: `AccountScreen`, `DepositScreen`, `WithdrawalScreen`, `HistoryScreen`, `SpinWheelScreen`, `PersonalInfoScreen`, `TeamReportsScreen`.
- **Tab Styling** Controlled via `tabBarStyle` and `tabBarIcon` options for a branded gradient footer.

## Authentication Flow
- **LoginScreen** (`src/screens/auth/LoginScreen.js`) traditional email/password entry with Remember Me toggles and navigation to registration.
- **RegisterScreen** (`src/screens/auth/RegisterScreen.js`) supports quick signup with basic details.
- **ProfessionalRegisterScreen** (`src/screens/auth/ProfessionalRegisterScreen.js`) multi-step onboarding capturing personal, professional, and security data.
- **ForgotPasswordScreen** (`src/screens/auth/ForgotPasswordScreen.js`) handles password reset by email, with validation feedback.
- **AuthContext** (`src/context/AuthContext.js`) exposes `user`, `signIn`, `signOut`, and error handling to all screens.

## Home Stack
- **HomeScreen** (`src/screens/main/HomeScreen.js`)
  - **Hero Section** Animated gradients, floating streaks, and ticker showcasing community achievements.
  - **Profile Snapshot** Displays user name and level from `useAuth` and `useUser` contexts.
  - **Stats Carousel** Animated cards cycling through income metrics.
  - **Quick Action Grid** Buttons for wealth fund, recharge, withdraw, history, tasks, team, WhatsApp, redeem gifts.
  - **Upgrade Prompt** Conditional modal via `UpgradePrompt` encouraging level progression.
  - **SpinWheel Overlay** Toggles `SpinWheel` component for gamified bonuses.
- **WealthFundScreen** (`src/screens/main/WealthFundScreen.js`) investment insights, featured banks, allocation charts, and withdrawal simulations with defensive loading states.
- **RedeemGiftsScreen** (`src/screens/main/RedeemGiftsScreen.js`) allows users to exchange points for gift cards or vouchers.
- **HelpBookScreen** (`src/screens/main/HelpBookScreen.js`) static knowledge base with FAQs and support steps.

## Task Stack
- **TaskScreen** (`src/screens/main/TaskScreen.js`)
  - **Task Summary Card** Shows current level reward rate, progress bar, and task availability based on weekdays.
  - **Installation Queue** Animated list of apps being installed with live progress via `Animated.Value`.
  - **App Store Grid** Renders `AppStoreCard` components with immersive marketing, install buttons, and premium badges.
  - **Limit Notifications** Banners alerting when daily quotas or concurrent installs are maxed.
- **AppStoreCard Component** (`src/components/AppStoreCard.js`) memoized card with screenshots, install action, and premium indicator using Ionicons.

## Upgrade Stack
- **UpgradeScreen** (`src/screens/main/UpgradeScreen.js`)
  - **Current Level Card** Summarizes active tier, task quota, per-task payout, and investment total.
  - **Level Comparison Table** Generates rows from `levels` constant, highlighting current tier.
  - **Level Descriptions** Updated copy for `Recruit` through `J6`, enumerating cost, task count, and daily earnings.
  - **Available Upgrades** Scrollable cards presenting next-level benefits and CTAs.
- **UpgradeDetailScreen** (`src/screens/main/UpgradeDetailScreen.js`) deeper breakdown of selected level perks, requirements, and upgrade steps.

## Team Stack
- **TeamScreen** (`src/screens/main/TeamScreen.js`)
  - **Referral Sharing** Quick copy/share controls using `Share` API and `Clipboard` to broadcast personalized referral links.
  - **Referral Rewards** Highlights bonus structure (KES 10 + 0.6%).
  - **ReferralTable** (`src/components/ReferralTable.js`) renders downline statistics, statuses, and earnings.
- **ReferralScreen** (`src/screens/main/ReferralScreen.js`) long-form presentation of referral tiers, marketing collateral, and tracking charts.
- **TeamReportsScreen** (`src/screens/main/TeamReportsScreen.js`) analytics with charts, performance cards, and export hooks.

## Account Stack
- **AccountScreen** (`src/screens/main/AccountScreen.js`)
  - **Profile Card** Shows avatar, contact info, and level badge with progress bar.
  - **Balance Summary** Recharge wallet, income wallet, earnings totals, and effective date timelines.
  - **Action Buttons** Quick links to recharge, withdraw, and history.
  - **Feature Grid** Access to spin wheel, WhatsApp group, wealth fund, team, personal info, records, reports, gifts, and help.
  - **Sign Out** Button wired to `signOut()` from `useAuth`.
- **DepositScreen** (`src/screens/main/DepositScreen.js`) M-Pesa recharge flow with preset buttons, validations, and STK push integration via `initiateSTKPush`.
- **WithdrawalScreen** (`src/screens/main/WithdrawalScreen.js`) request cash-out with bank/mobile money options, fee breakdown, OTP simulation.
- **HistoryScreen** (`src/screens/main/HistoryScreen.js`) tabbed transaction ledger filtering deposits, withdrawals, earnings, investments.
- **SpinWheelScreen** (`src/screens/main/SpinWheelScreen.js`) gamified wheel with prize segments, celebratory animations, and winner feed.
- **PersonalInfoScreen** (`src/screens/main/PersonalInfoScreen.js`) editable user profile, KYC documents, and security toggles.
- **TeamReportsScreen** accessible via Account stack for managerial metrics.

## Financial Operations
- **Wallet Structure** `mainWallet`, `incomeWallet`, and derived balances managed in `UserContext` (`src/context/UserContext.js`).
- **Transactions** Additions and deductions recorded through helper methods like `addToDepositWallet` and `completeTask`.
- **Formatting** Consistent currency display with `toLocaleString()` and theming colors for gains/losses (`HistoryScreen`).

## Investment & Wealth Features
- **Wealth Fund** Showcases investment products, allocation breakdown, featured banks, streak rewards, and risk summaries.
- **Team Reports** Aligns team activity with income projections, including charts and milestone tracking.

## Gamification & Engagement
- **Spin Wheel** (`src/components/SpinWheel.js`) interactive SVG-based wheel with physics-inspired animation, confetti, and prize ledger.
- **Daily Task Limits** Controlled via `currentLevel.tasks` with alerts when limits reached.
- **Streaks & Prompts** Home ticker and upgrade prompt encourage consistent engagement.

## Support & Help Resources
- **Help Book** Step-by-step articles for account management, deposits, withdrawals, and troubleshooting.
- **WhatsApp Integration** Direct links from Home and Account screens using `Linking` to join community channels or contact support.
- **Customer Care Shortcut** `openCustomerCareWhatsApp()` in `HomeScreen` pre-populates support messages.

## State Management & Contexts
- **AuthContext** (`src/context/AuthContext.js`) handles authentication state, user metadata, sign-in/out.
- **UserContext** (`src/context/UserContext.js`) tracks profile, wallets, tasks, upgrades, and exposes methods like `installApp`, `completeTask`, `addReferral`.
- **AppContext** (`src/context/AppContext.js`) maintains task app catalog, installation status, and install progress.
- **NotificationContext** (`src/context/NotificationContext.js`) centralizes toast banners and feedback messages.

## UI Components & Styling
- **Theme Constants** (`src/constants/theme.js`) defines colors, spacing, typography, and cross-platform shadows via `Platform.select`.
- **Reusable Components** `UpgradePrompt`, `NotificationBanner`, `AppStoreCard`, `ReferralTable`, `SpinWheel`, `NotificationBanner` unify patterns.
- **Gradients** Provided through `gradients` constant and `LinearGradient` usage across cards and backgrounds.

## Notifications & Feedback
- **NotificationBanner** (`src/components/NotificationBanner.js`) animated toast with `Animated` API and `useNativeDriver` handling.
- **Modal Prompts** Upgrade prompts, alerts, and success banners driven by context callbacks.
- **Progress Indicators** `ActivityIndicator`, Animated progress bars, and textual statuses keep users informed during deposits and installs.

## Appendix: Key Data References
- **Levels Constant** (`src/constants/levels.js`) defines tier metadata used across Home, Task, Upgrade, and Account screens.
- **Branding** (`src/constants/branding.js`) houses `APP_NAME`, `APP_SHORT_NAME`, and marketing copy.
- **Mock Data** (`src/utils/mockData.js`) generates task apps, banks, and weekday checks.
- **Services** (`src/services/api.js`) includes `initiateSTKPush` and other mocked network calls.

---

*Generated multi-screen walkthrough to support documentation and onboarding needs.*
