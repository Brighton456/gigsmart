# 🚀 Gig-Smart - Your Partner for Smarter Gig Earnings

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/yourusername/gig-smart)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React Native](https://img.shields.io/badge/React%20Native-0.72.6-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-49.0.15-black.svg)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)

A comprehensive mobile platform for gig workers to earn money through tasks, investments, and referrals. Built with React Native, Expo, and Supabase for a seamless, professional experience.

## ✨ Features

### 🎯 **Professional Registration System**
- **Multi-step registration** with comprehensive validation
- **Personal details collection** (name, contact, location, ID)
- **Professional information** (industry, occupation, experience)
- **Enhanced security** with strong password requirements
- **Terms & conditions** with marketing preferences
- **Real-time validation** with user-friendly error messages

### 🏷️ **Complete Gig-Smart Branding**
- **Consistent branding** across all screens and components
- **Professional color scheme** with gradient designs
- **Custom app icons** and loading screens
- **Branded notifications** and success messages
- **Cohesive user experience** throughout the platform

### 💰 **Enhanced Finance UX**
- **Keyboard-friendly inputs** with proper focus management
- **Real-time balance updates** with live synchronization
- **Dual wallet system** (Main Wallet + Task Wallet)
- **Secure transaction processing** with M-Pesa integration
- **Comprehensive transaction history** with detailed records
- **Investment portfolio management** with real-time value tracking

### 🎨 **Animated Dashboard**
- **High-speed dual ticker** with opposite-direction scrolling
- **Pulsing button animations** with interactive feedback
- **Live statistics carousel** with rotating metrics
- **Floating icon effects** with smooth transitions
- **Dynamic progress bars** with real-time updates
- **Upgrade prompts** with slide-in animations

### 🔔 **Global Notification System**
- **Toast notifications** for all major actions
- **Success/error feedback** with appropriate icons
- **Slide-in animations** with auto-dismiss functionality
- **Contextual messages** for deposits, withdrawals, investments
- **Upgrade encouragement** with personalized prompts
- **Real-time updates** via Supabase subscriptions

### 🗄️ **Supabase Backend Integration**
- **Complete authentication system** with secure user management
- **Real-time database** with Row Level Security (RLS)
- **Automatic profile creation** with comprehensive user data
- **Investment tracking** with automated value calculations
- **Transaction logging** with full audit trails
- **Referral system** with bonus automation
- **Level management** with upgrade tracking

## 🏗️ Architecture

### **Frontend Stack**
- **React Native 0.72.6** - Cross-platform mobile development
- **Expo 49.0.15** - Development platform and build tools
- **React Navigation 6** - Navigation and routing
- **Expo Linear Gradient** - Beautiful gradient designs
- **React Native Reanimated** - Smooth animations
- **AsyncStorage** - Local data persistence

### **Backend Stack**
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Supabase Auth** - User authentication and authorization
- **Real-time subscriptions** - Live data synchronization
- **Row Level Security** - Data access control
- **Edge Functions** - Server-side logic (optional)

### **Database Schema**
```sql
📊 Tables:
├── profiles (user data & wallets)
├── levels (J1-J5 upgrade system)
├── transactions (financial records)
├── investments (portfolio tracking)
├── referrals (referral system)
├── completed_tasks (task history)
├── banks (investment options)
├── notifications (in-app alerts)
└── app_installations (task tracking)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account
- Android Studio (for Android) or Xcode (for iOS)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gig-smart.git
   cd gig-smart
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Supabase**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Add your Supabase credentials
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Run the database setup**
   - Copy contents of `supabase_schema.sql`
   - Paste in Supabase SQL Editor
   - Execute to create tables and policies

5. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

6. **Run on device/simulator**
   - Scan QR code with Expo Go app
   - Or press 'a' for Android, 'i' for iOS

## 📱 App Screens

### **Authentication Flow**
- **Professional Registration** - Multi-step form with validation
- **Login Screen** - Secure authentication with Supabase
- **Forgot Password** - Email-based password reset
- **Email Verification** - Account activation process

### **Main Dashboard**
- **Home Screen** - Animated dashboard with live stats
- **Task Screen** - App installation tasks with rewards
- **Wealth Fund** - Investment portfolio management
- **Team Screen** - Referral system and team building
- **Profile Screen** - User settings and account management

### **Financial Screens**
- **Deposit Screen** - M-Pesa integration for funding
- **Withdrawal Screen** - Secure fund withdrawal
- **Investment Details** - Individual investment tracking
- **Transaction History** - Complete financial records
- **Level Upgrade** - Account level management

## 🎯 User Journey

### **New User Experience**
1. **Professional Registration** - Comprehensive onboarding
2. **Email Verification** - Account security
3. **Welcome Dashboard** - Feature introduction
4. **First Task** - Guided task completion
5. **Investment Education** - Portfolio building
6. **Referral Activation** - Network expansion

### **Daily User Flow**
1. **Dashboard Check** - View earnings and progress
2. **Task Completion** - Install apps for rewards
3. **Investment Management** - Monitor portfolio
4. **Withdrawal Processing** - Access earnings
5. **Referral Sharing** - Expand network
6. **Level Progression** - Upgrade benefits

## 🔧 Configuration

### **Environment Variables**
```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App Configuration
EXPO_PUBLIC_APP_NAME=Gig-Smart
EXPO_PUBLIC_APP_VERSION=2.0.0
EXPO_PUBLIC_API_URL=https://api.gig-smart.com
```

### **App Configuration**
```javascript
// app.config.js
export default {
  expo: {
    name: "Gig-Smart",
    slug: "gig-smart",
    version: "2.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#1e40af"
    },
    // ... additional config
  }
};
```

## 🧪 Testing

### **Run Tests**
```bash
npm test
# or
yarn test
```

### **Test Coverage**
- Unit tests for utility functions
- Integration tests for API calls
- Component tests for UI elements
- E2E tests for user flows

### **Manual Testing Checklist**
- [ ] User registration and login
- [ ] Wallet operations (deposit/withdraw)
- [ ] Investment creation and management
- [ ] Task completion and rewards
- [ ] Referral system functionality
- [ ] Level upgrade process
- [ ] Real-time notifications
- [ ] Offline functionality

## 🚀 Deployment

### **Development Build**
```bash
expo build:android
expo build:ios
```

### **Production Build**
```bash
# Android
expo build:android --type app-bundle

# iOS
expo build:ios --type archive
```

### **Environment Setup**
1. **Staging Environment** - Testing with production-like data
2. **Production Environment** - Live app with real users
3. **Database Migrations** - Schema updates and data migration
4. **Monitoring Setup** - Error tracking and performance monitoring

## 📊 Analytics & Monitoring

### **Key Metrics**
- **User Acquisition** - Registration and activation rates
- **Task Completion** - App installation success rates
- **Investment Activity** - Portfolio creation and management
- **Financial Transactions** - Deposit and withdrawal volumes
- **Referral Performance** - Network growth and bonuses
- **User Retention** - Daily and monthly active users

### **Monitoring Tools**
- **Supabase Dashboard** - Database and API monitoring
- **Expo Analytics** - App performance and crashes
- **Custom Events** - Business-specific tracking
- **Error Reporting** - Real-time error alerts

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### **Code Standards**
- ESLint configuration for code quality
- Prettier for code formatting
- Conventional commits for clear history
- TypeScript for type safety (optional)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Documentation**
- [Setup Guide](SUPABASE_SETUP.md) - Complete integration guide
- [API Reference](docs/API.md) - Backend API documentation
- [Component Library](docs/COMPONENTS.md) - UI component guide

### **Community**
- **GitHub Issues** - Bug reports and feature requests
- **Discussions** - Community support and ideas
- **Discord** - Real-time developer chat
- **Email** - support@gig-smart.com

### **Professional Support**
For enterprise support and custom development, contact our team at enterprise@gig-smart.com

---

**Built with ❤️ by the Gig-Smart Team**

*Empowering gig workers with smart earning opportunities*
