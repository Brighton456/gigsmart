# Gig-Smart Supabase Integration Setup Guide

## Overview
This guide will help you set up Supabase backend integration for the Gig-Smart platform with complete authentication, real-time data, and secure database operations.

## Prerequisites
- Supabase account (https://supabase.com)
- Node.js and npm/yarn installed
- Expo CLI installed

## Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js react-native-url-polyfill
# or
yarn add @supabase/supabase-js react-native-url-polyfill
```

## Step 2: Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Note down your project URL and anon key
3. Go to SQL Editor in your Supabase dashboard
4. Copy and paste the contents of `supabase_schema.sql` and execute it

## Step 3: Configure Environment Variables

Create a `.env` file in your project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Or update your `app.config.js`:

```javascript
export default {
  expo: {
    name: "Gig-Smart",
    slug: "gig-smart",
    // ... other config
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
};
```

## Step 4: Update App.js to Use Supabase Contexts

Replace the imports in `App.js`:

```javascript
import { AuthProvider } from './src/context/SupabaseAuthContext';
import { UserProvider } from './src/context/SupabaseUserContext';
```

## Step 5: Update Navigation

Update your navigation files to use the new professional registration screen:

In `src/navigation/AuthNavigator.js`, replace RegisterScreen with ProfessionalRegisterScreen:

```javascript
import ProfessionalRegisterScreen from '../screens/auth/ProfessionalRegisterScreen';

// In your stack navigator
<Stack.Screen 
  name="Register" 
  component={ProfessionalRegisterScreen} 
  options={{ headerShown: false }} 
/>
```

## Step 6: Database Schema Features

The database includes:

### Tables:
- **profiles**: Extended user profiles with personal and professional info
- **levels**: User levels (J1-J5) with costs and benefits
- **transactions**: All financial transactions with full audit trail
- **investments**: Investment tracking with real-time value updates
- **referrals**: Referral system with bonus tracking
- **completed_tasks**: Task completion history
- **banks**: Investment bank options
- **notifications**: In-app notification system
- **app_installations**: Task app installation tracking

### Security Features:
- Row Level Security (RLS) enabled on all tables
- User-specific data access policies
- Secure authentication with Supabase Auth
- Real-time subscriptions for live updates

### Automatic Features:
- Profile creation on user registration
- Timestamp management (created_at, updated_at)
- Investment value calculations
- Transaction logging
- Referral bonus automation

## Step 7: Real-time Features

The integration includes:

1. **Live Wallet Updates**: Real-time balance changes
2. **Investment Tracking**: Automatic value updates
3. **Transaction History**: Instant transaction recording
4. **Notification System**: Real-time in-app notifications
5. **Profile Sync**: Automatic profile synchronization

## Step 8: Testing the Integration

1. Start your Expo development server:
   ```bash
   expo start
   ```

2. Test the following features:
   - User registration with the new professional form
   - Login/logout functionality
   - Wallet operations (deposit, withdraw)
   - Investment creation and withdrawal
   - Task completion and rewards
   - Level upgrades
   - Referral system

## Step 9: Production Deployment

For production deployment:

1. **Environment Variables**: Set up production environment variables
2. **Database Backup**: Set up automated backups in Supabase
3. **Monitoring**: Enable Supabase monitoring and alerts
4. **Rate Limiting**: Configure rate limiting for API calls
5. **Storage**: Set up Supabase Storage for user avatars (optional)

## API Usage Examples

### Authentication
```javascript
import { useAuth } from './src/context/SupabaseAuthContext';

const { signIn, signUp, signOut, user } = useAuth();

// Sign in
await signIn({ email: 'user@example.com', password: 'password' });

// Sign up
await signUp({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securepassword',
  phone: '+254712345678',
  // ... other fields
});
```

### User Operations
```javascript
import { useUser } from './src/context/SupabaseUserContext';

const { profile, addToMainWallet, createInvestment, upgradeLevel } = useUser();

// Add money to wallet
await addToMainWallet(1000, 'M-Pesa deposit');

// Create investment
await createInvestment(selectedBank, 5000, 2.5, 30);

// Upgrade level
await upgradeLevel(2, 500);
```

## Troubleshooting

### Common Issues:

1. **RLS Policies**: Ensure Row Level Security policies are properly set up
2. **Environment Variables**: Verify EXPO_PUBLIC_ prefix for Expo environment variables
3. **Network Issues**: Check Supabase project status and network connectivity
4. **Authentication**: Verify email confirmation settings in Supabase Auth

### Debug Mode:
Enable debug logging by adding to your supabaseClient.js:

```javascript
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'gig-smart-mobile',
    },
  },
  // Enable debug mode
  debug: __DEV__,
});
```

## Support

For additional support:
- Supabase Documentation: https://supabase.com/docs
- Supabase Community: https://github.com/supabase/supabase/discussions
- React Native Integration: https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native

## Security Best Practices

1. **Never expose service_role key** in client-side code
2. **Use environment variables** for sensitive configuration
3. **Implement proper RLS policies** for data access
4. **Validate user input** on both client and server side
5. **Monitor database usage** and set up alerts
6. **Regular security audits** of your Supabase project

## Performance Optimization

1. **Use indexes** on frequently queried columns
2. **Implement pagination** for large data sets
3. **Cache frequently accessed data** using React Query or SWR
4. **Optimize real-time subscriptions** to avoid unnecessary updates
5. **Use Supabase Edge Functions** for complex server-side logic

This completes the Supabase integration setup for your Gig-Smart platform!
