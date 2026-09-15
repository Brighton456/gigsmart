import React, { lazy, Suspense, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, Spin, App as AntdApp } from 'antd';
import { useAuthStore } from './store/useAuthStore';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import AppLayout from './components/Layout/AppLayout';
import LoginPage from './pages/LoginPage';
import PerformanceMonitor from './components/common/PerformanceMonitor';

// Preload critical components
import('./pages/DashboardPage');
import('./pages/UsersPage');

// Lazy load pages for performance optimization
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const WithdrawalsPage = lazy(() => import('./pages/WithdrawalsPage'));
const InvestmentsPage = lazy(() => import('./pages/InvestmentsPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const ReferralsPage = lazy(() => import('./pages/ReferralsPage'));
const SpinAttemptsPage = lazy(() => import('./pages/SpinAttemptsPage'));
const SuspiciousActivityPage = lazy(() => import('./pages/SuspiciousActivityPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ReceiptDemoPage = lazy(() => import('./pages/ReceiptDemoPage'));

// Lazy load analytics pages
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const RevenuePage = lazy(() => import('./pages/RevenuePage'));
const UsersAnalyticsPage = lazy(() => import('./pages/UsersAnalyticsPage'));
const FinancialInsightsPage = lazy(() => import('./pages/FinancialInsightsPage'));

const App: React.FC = () => {
  const { user } = useAuthStore();

  // Memoized theme configuration
  const themeConfig = useMemo(() => ({
    algorithm: theme.defaultAlgorithm,
    token: {
      colorPrimary: '#667eea',
      borderRadius: 6,
      wireframe: false,
      fontSize: 12,
      controlHeight: 28,
      controlHeightSM: 20,
      controlHeightLG: 36,
    },
    components: {
      Layout: {
        headerBg: '#ffffff',
        siderBg: '#ffffff',
      },
      Menu: {
        itemBg: 'transparent',
      },
    },
  }), []);

  // Performance optimization callback
  const handleOptimize = useCallback(() => {
    // Clear caches and force garbage collection if available
    if ('gc' in window && typeof window.gc === 'function') {
      window.gc();
    }
    
    // Clear performance entries
    if ('performance' in window && performance.clearResourceTimings) {
      performance.clearResourceTimings();
    }
    
    // Force re-render of components
    window.location.reload();
  }, []);

  // Memoized loading fallback
  const loadingFallback = useMemo(() => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '200vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Spin size="large" tip="Loading..." />
    </div>
  ), []);

  return (
    <AntdApp>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#667eea',
            borderRadius: 6,
            wireframe: false,
            fontSize: 12,
            controlHeight: 28,
            controlHeightSM: 20,
            controlHeightLG: 36,
          },
          components: {
            Layout: {
              headerBg: '#ffffff',
              siderBg: '#ffffff',
            },
            Menu: {
              itemBg: 'transparent',
              itemSelectedBg: '#f0f0f0',
              itemHoverBg: '#fafafa',
            },
          },
        }}
      >
      <Router>
        <Suspense fallback={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            <Spin size="large" />
          </div>
        }>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Suspense fallback={
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: '200px'
                    }}>
                      <Spin size="small" />
                    </div>
                  }>
                    <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/withdrawals" element={<WithdrawalsPage />} />
                    <Route path="/investments" element={<InvestmentsPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/referrals" element={<ReferralsPage />} />
                    <Route path="/spin-attempts" element={<SpinAttemptsPage />} />
                    <Route path="/suspicious-activity" element={<SuspiciousActivityPage />} />
                    
                    {/* New beautiful analytics pages */}
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/revenue" element={<RevenuePage />} />
                    <Route path="/users-analytics" element={<UsersAnalyticsPage />} />
                    <Route path="/financial-insights" element={<FinancialInsightsPage />} />
                    
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <AppLayout>
                          <SettingsPage />
                        </AppLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/receipt-demo" element={
                      <ProtectedRoute>
                        <AppLayout>
                          <ReceiptDemoPage />
                        </AppLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
      </Router>
      <PerformanceMonitor onOptimize={handleOptimize} />
    </ConfigProvider>
    </AntdApp>
  );
};

export default App;
