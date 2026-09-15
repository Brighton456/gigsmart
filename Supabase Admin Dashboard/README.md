# Supabase Admin Dashboard

A comprehensive, professional React admin dashboard for managing your Supabase-powered earnings platform. This dashboard provides real-time analytics, user management, transaction processing, and complete control over your platform operations.

## 🚀 Features

### 📊 Analytics Dashboard
- **Real-time Metrics**: Track total users, revenue, withdrawals, and investments
- **Interactive Charts**: Revenue trends, user growth, earnings breakdown, and investment performance
- **Date Range Filtering**: Analyze data for custom time periods
- **Key Performance Indicators**: Monitor platform health and growth

### 👥 User Management
- **Complete User Profiles**: View and edit all user information
- **Advanced Filtering**: Search by name, email, phone, or category
- **Status Management**: Activate/deactivate users, manage levels
- **Wallet Management**: Update main wallet, income wallet, and wealth fund balances
- **Bulk Operations**: Export user data to Excel

### 💳 Payment Processing
- **Transaction Management**: View, filter, and update all transactions
- **Withdrawal Requests**: Approve or reject withdrawal requests with detailed review
- **Payment Methods**: Support for M-Pesa, bank transfers, and more
- **Export Functionality**: Download transaction data as Excel files
- **Status Tracking**: Real-time status updates for all payments

### 📈 Investment Tracking
- **Investment Portfolio**: Monitor all user investments
- **Performance Analytics**: Track returns and maturity dates
- **Bank Management**: Manage investment bank options
- **Risk Assessment**: Monitor investment performance

### 🎯 Task & Referral Management
- **Task Completions**: Track user task performance
- **Referral Network**: View referral relationships and earnings
- **Spin Attempts**: Monitor game-based earnings
- **Performance Metrics**: Analyze user engagement

### 🔒 Security & Monitoring
- **Suspicious Activity**: Detect and review potentially fraudulent behavior
- **Risk Scoring**: Automated risk assessment for all activities
- **Activity Logs**: Complete audit trail of all platform activities
- **IP Tracking**: Monitor user locations and access patterns

### ⚙️ System Settings
- **Platform Configuration**: Manage site-wide settings
- **Financial Controls**: Set withdrawal limits and bonus percentages
- **Feature Toggles**: Enable/disable platform features
- **Maintenance Mode**: Control platform availability

## 🛠️ Technology Stack

- **Frontend**: React 19 with TypeScript
- **UI Framework**: Ant Design 6.x
- **Charts**: Recharts for data visualization
- **State Management**: Zustand for lightweight state management
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime Subscriptions
- **Styling**: CSS-in-JS with Ant Design theming
- **Build Tool**: Create React App with Webpack

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- pnpm package manager
- Supabase project with appropriate permissions

### Setup Instructions

1. **Clone and Install**
   ```bash
   cd supabase-admin-dashboard
   pnpm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url_here
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **Start Development Server**
   ```bash
   pnpm start
   ```

4. **Access the Dashboard**
   Open http://localhost:3000 in your browser

## 🔐 Authentication

The dashboard requires authentication through Supabase Auth. Ensure you have:

1. **Admin User**: Create an admin user in your Supabase Auth dashboard
2. **RLS Policies**: Configure Row Level Security policies for admin access
3. **Service Role**: Consider using service role key for elevated permissions

## 📊 Database Schema

The dashboard is designed to work with your existing Supabase schema including:

### Core Tables
- `users` - User profiles and wallet information
- `transactions` - All financial transactions
- `withdrawal_requests` - Withdrawal requests and status
- `investments` - User investment records
- `task_completions` - Task completion tracking
- `referrals` - Referral relationships
- `spin_attempts` - Game-based earnings
- `suspicious_activity` - Security monitoring

### Admin Views
- `admin_user_summary` - Complete user overview
- `admin_transactions_with_users` - Transactions with user details
- `admin_withdrawal_requests_with_balance` - Withdrawals with balance info
- `admin_investments_with_users` - Investments with user details
- `admin_task_completions_with_users` - Tasks with user information
- `admin_referrals_with_users` - Referrals with user details
- `admin_spin_attempts_with_users` - Spin attempts with user details
- `admin_daily_statistics` - Daily platform statistics

## 🚀 Deployment

### Production Build
```bash
pnpm build
```

### Environment Variables for Production
- `REACT_APP_SUPABASE_URL` - Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Deployment Options

1. **Netlify**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=build
   ```

2. **Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **AWS S3 + CloudFront**
   - Upload build folder to S3
   - Configure CloudFront distribution
   - Set up custom domain and SSL

## 🔧 Configuration

### Supabase Setup

1. **Enable Required Extensions**
   ```sql
   -- Enable necessary extensions
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

2. **Create Admin Views** (if not already exists)
   ```sql
   -- Example admin view for users
   CREATE OR REPLACE VIEW admin_user_summary AS
   SELECT 
     u.*,
     l.name as level_name,
     COUNT(DISTINCT r.referred_id) as total_referrals
   FROM users u
   LEFT JOIN levels l ON u.current_level = l.id
   LEFT JOIN referrals r ON u.id = r.referrer_id
   GROUP BY u.id, l.name;
   ```

3. **Set Up RLS Policies**
   ```sql
   -- Enable RLS
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   
   -- Admin access policy
   CREATE POLICY "Admins can view all users" ON users
     FOR ALL USING (
       auth.jwt() ->> 'role' = 'admin'
     );
   ```

## 🎨 Customization

### Theming
The dashboard uses Ant Design's theming system. Customize colors in `src/App.tsx`:

```typescript
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#your-brand-color',
      borderRadius: 8,
    },
  }}
>
```

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add menu item in `src/components/Layout/AppLayout.tsx`

### Custom Charts
Add new charts using Recharts in the dashboard page:

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const MyChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#8884d8" />
    </LineChart>
  </ResponsiveContainer>
);
```

## 🔒 Security Considerations

1. **API Keys**: Never expose service role keys in frontend
2. **RLS Policies**: Implement proper Row Level Security
3. **Input Validation**: All forms include validation
4. **Error Handling**: Proper error messages without exposing sensitive data
5. **HTTPS**: Always use HTTPS in production
6. **CORS**: Configure proper CORS settings in Supabase

## 📈 Performance Optimization

1. **Code Splitting**: Automatic with React.lazy()
2. **Image Optimization**: Compress and optimize images
3. **Caching**: Implement proper caching strategies
4. **Bundle Size**: Monitor and optimize bundle size
5. **Database Indexing**: Ensure proper database indexes

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check Supabase CORS settings
   - Ensure correct URL in environment variables

2. **Authentication Issues**
   - Verify Supabase Auth configuration
   - Check RLS policies

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript configuration

4. **Performance Issues**
   - Monitor database queries
   - Check network requests in browser dev tools

### Debug Mode
Enable debug mode by adding to `.env.local`:
```
REACT_APP_DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Add tests if applicable
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the Supabase documentation

---

**Built with ❤️ using React, TypeScript, and Supabase**
