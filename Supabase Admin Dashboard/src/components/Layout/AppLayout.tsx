import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Badge, Button, theme, Spin } from 'antd';
import { 
  DashboardOutlined,
  UserOutlined,
  TransactionOutlined,
  BankOutlined,
  HistoryOutlined,
  TeamOutlined,
  GiftOutlined,
  SecurityScanOutlined,
  SettingOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  SunOutlined,
  MoonOutlined,
  BellOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  DollarOutlined,
  TrophyOutlined,
  RocketOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = React.memo(({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const menuItems: any[] = useMemo(() => [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Users',
    },
    {
      key: '/transactions',
      icon: <TransactionOutlined />,
      label: 'Transactions',
    },
    {
      key: '/withdrawals',
      icon: <BankOutlined />,
      label: 'Withdrawals',
    },
    {
      key: '/investments',
      icon: <BankOutlined />,
      label: 'Investments',
    },
    {
      key: '/tasks',
      icon: <HistoryOutlined />,
      label: 'Task Completions',
    },
    {
      key: '/referrals',
      icon: <TeamOutlined />,
      label: 'Referrals',
    },
    {
      key: '/spin-attempts',
      icon: <GiftOutlined />,
      label: 'Spin Attempts',
    },
    {
      key: '/suspicious-activity',
      icon: <SecurityScanOutlined />,
      label: 'Security',
    },
    {
      type: 'divider',
    },
    {
      key: 'analytics-group',
      label: '📊 Analytics',
      type: 'group',
      children: [
        {
          key: '/analytics',
          icon: <BarChartOutlined />,
          label: 'Revenue Analytics',
        },
        {
          key: '/financial-insights',
          icon: <PieChartOutlined />,
          label: 'Financial Insights',
        },
        {
          key: '/user-analytics',
          icon: <LineChartOutlined />,
          label: 'User Analytics',
        },
        {
          key: '/performance-metrics',
          icon: <TrophyOutlined />,
          label: 'Performance Metrics',
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: 'management-group',
      label: '⚙️ Management',
      type: 'group',
      children: [
        {
          key: '/settings',
          icon: <SettingOutlined />,
          label: 'Settings',
        },
        {
          key: '/reports',
          icon: <FileTextOutlined />,
          label: 'Reports',
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: signOut,
    },
  ], []);

  const handleMenuClick = useCallback(({ key }: { key: string }) => {
    navigate(key);
  }, [navigate]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(!isDarkMode);
    // In a real app, you'd implement theme switching logic here
  }, [isDarkMode]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        breakpoint="sm"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
        style={{
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorder}`,
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          boxShadow: collapsed ? 'none' : '2px 0 8px rgba(0,0,0,0.15)'
        }}
        width={180}
      >
        <div style={{ 
          padding: '8px', 
          borderBottom: `1px solid ${token.colorBorder}`,
          background: isDarkMode ? token.colorBgLayout : token.colorBgContainer
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: collapsed ? 'center' : 'flex-start'
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '4px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '12px'
            }}>
              {collapsed ? 'A' : 'Admin'}
            </div>
            {!collapsed && (
              <span style={{ 
                marginLeft: '8px', 
                fontSize: '14px', 
                fontWeight: 600,
                color: token.colorText
              }}>
                Dashboard
              </span>
            )}
          </div>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ 
            border: 'none',
            background: 'transparent'
          }}
        />
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 0 : 180, transition: 'margin-left 0.2s' }}>
        <Header style={{ 
          padding: '0 12px', 
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 52,
          position: 'sticky',
          top: 0,
          zIndex: 999
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '12px',
                width: 28,
                height: 28,
              }}
            />
          </div>

          <Space size="middle">
            <Button
              type="text"
              icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              style={{
                fontSize: '12px',
                width: 28,
                height: 28,
              }}
            />
            
            <Badge count={5} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{
                  fontSize: '12px',
                  width: 28,
                  height: 28,
                }}
              />
            </Badge>
            
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'profile',
                    icon: <UserOutlined />,
                    label: 'Profile',
                  },
                  {
                    key: 'settings',
                    icon: <SettingOutlined />,
                    label: 'Settings',
                  },
                  {
                    type: 'divider',
                  },
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: 'Logout',
                    onClick: signOut,
                  },
                ],
              }}
              placement="bottomRight"
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '8px',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = token.colorBgTextHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}>
                <Avatar 
                  icon={<UserOutlined />}
                  style={{ 
                    backgroundColor: '#1890ff',
                    border: `1px solid ${token.colorBorder}`,
                    width: 28,
                    height: 28
                  }}
                />
                {!collapsed && (
                  <div style={{ marginLeft: '8px' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: 500,
                      color: token.colorText
                    }}>
                      {user?.name || 'Admin'}
                    </div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: token.colorTextSecondary
                    }}>
                      {user?.email || 'admin@example.com'}
                    </div>
                  </div>
                )}
              </div>
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{ 
          margin: '6px',
          padding: '12px',
          background: token.colorBgContainer,
          borderRadius: token.borderRadius,
          minHeight: 'calc(100vh - 64px)',
          overflow: 'auto'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
});

AppLayout.displayName = 'AppLayout';

export default AppLayout;
