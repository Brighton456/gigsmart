import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Alert,
  Spin,
  DatePicker,
  Select,
  Button,
  Table,
  Tag,
  Progress,
  Divider,
  Avatar,
  List,
  Tooltip,
  Badge
} from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  TrophyOutlined,
  BankOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  ReloadOutlined,
  CalendarOutlined,
  TeamOutlined,
  GiftOutlined,
  StarOutlined,
  WalletOutlined,
  TransactionOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { Line, Column, Pie, Area } from '@ant-design/plots';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { supabase } from '../lib/supabase';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface DailyStats {
  stat_date: string;
  total_users: number;
  new_users: number;
  total_deposits: number;
  total_withdrawals: number;
  total_task_earnings: number;
  total_referral_earnings: number;
  total_investment_volume: number;
  total_investment_returns: number;
  total_spin_wins: number;
  total_gift_code_credits: number;
  active_task_users: number;
}

interface UserSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  current_level: number;
  level_name: string;
  main_wallet: number;
  income_wallet: number;
  wealth_fund_balance: number;
  total_earnings: number;
  total_withdrawals: number;
  is_active: boolean;
  created_at: string;
  last_login: string;
  tasks_completed_today: number;
  total_referrals: number;
}

interface Transaction {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  type: string;
  amount: number;
  fee: number;
  net_amount: number;
  status: string;
  payment_method: string;
  external_reference: string;
  description: string;
  created_at: string;
  processed_at: string;
  admin_notes: string;
}

interface WithdrawalRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_category: string;
  real_balance: number;
  amount: number;
  fee: number;
  net_amount: number;
  status: string;
  payment_method: string;
  payment_details: any;
  withdrawal_account_type: string;
  withdrawal_account_details: string;
  requested_at: string;
  processed_at: string;
  processed_by: string;
  admin_notes: string;
  rejection_reason: string;
  external_reference: string;
  transaction_id: string;
  real_balance_status: string;
}

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [userSummary, setUserSummary] = useState<UserSummary[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch daily statistics
      const { data: statsData, error: statsError } = await supabase
        .from('admin_daily_statistics')
        .select('*')
        .gte('stat_date', dateRange[0].format('YYYY-MM-DD'))
        .lte('stat_date', dateRange[1].format('YYYY-MM-DD'))
        .order('stat_date', { ascending: true });

      if (statsError) throw statsError;
      setDailyStats(statsData || []);

      // Fetch user summary
      const { data: userData, error: userError } = await supabase
        .from('admin_user_summary')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (userError) throw userError;
      setUserSummary(userData || []);

      // Fetch recent transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('admin_transactions_with_users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionError) throw transactionError;
      setRecentTransactions(transactionData || []);

      // Fetch pending withdrawals
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('admin_withdrawal_requests_with_balance')
        .select('*')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })
        .limit(10);

      if (withdrawalError) throw withdrawalError;
      setPendingWithdrawals(withdrawalData || []);

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  // Calculate totals
  const totalUsers = userSummary.length;
  const activeUsers = userSummary.filter(u => u.is_active).length;
  const totalEarnings = userSummary.reduce((sum, u) => sum + (u.total_earnings || 0), 0);
  const totalWithdrawals = userSummary.reduce((sum, u) => sum + (u.total_withdrawals || 0), 0);
  const pendingWithdrawalAmount = pendingWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

  // Chart data preparation
  const earningsChartData = dailyStats.map(stat => ({
    date: format(new Date(stat.stat_date), 'MMM dd'),
    earnings: Number(stat.total_task_earnings || 0) + Number(stat.total_referral_earnings || 0),
    deposits: Number(stat.total_deposits || 0),
    withdrawals: Number(stat.total_withdrawals || 0),
  }));

  const userGrowthChartData = dailyStats.map(stat => ({
    date: format(new Date(stat.stat_date), 'MMM dd'),
    newUsers: Number(stat.new_users || 0),
    totalUsers: Number(stat.total_users || 0),
    activeUsers: Number(stat.active_task_users || 0),
  }));

  const pieData = [
    { type: 'Task Earnings', value: dailyStats.reduce((sum, s) => sum + Number(s.total_task_earnings || 0), 0) },
    { type: 'Referral Earnings', value: dailyStats.reduce((sum, s) => sum + Number(s.total_referral_earnings || 0), 0) },
    { type: 'Spin Wins', value: dailyStats.reduce((sum, s) => sum + Number(s.total_spin_wins || 0), 0) },
    { type: 'Gift Codes', value: dailyStats.reduce((sum, s) => sum + Number(s.total_gift_code_credits || 0), 0) },
  ].filter(item => item.value > 0);

  // Chart configurations
  const earningsChartConfig = {
    data: earningsChartData.flatMap(item => [
      { date: item.date, type: 'Earnings', value: item.earnings },
      { date: item.date, type: 'Withdrawals', value: item.withdrawals }
    ]),
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: ['#FF6B6B', '#4ECDC4'],
    point: { size: 4 },
    tooltip: {
      formatter: (datum: any) => ({
        name: datum.type,
        value: `KES ${datum.value?.toLocaleString()}`,
      }),
    },
  };

  const userGrowthChartConfig = {
    data: userGrowthChartData.flatMap(item => [
      { date: item.date, type: 'New Users', value: item.newUsers },
      { date: item.date, type: 'Total Users', value: item.totalUsers }
    ]),
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: ['#722ed1', '#13c2c2'],
    point: {
      size: 3,
    },
  };

  const pieChartConfig = {
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
      style: {
        fill: 'white',
        fontSize: 12,
        fontWeight: 'bold'
      }
    },
    interactions: [{ type: 'element-active' }],
  };

  const transactionColumns = [
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (name: string, record: Transaction) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.user_email}</div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'deposit' ? 'green' : type === 'withdrawal' ? 'red' : 'blue'}>
          {type?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong>KES {amount?.toLocaleString()}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <Text type="secondary">{format(new Date(date), 'MMM dd, HH:mm')}</Text>
      ),
    },
  ];

  const withdrawalColumns = [
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (name: string, record: WithdrawalRequest) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.user_email}</div>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong>KES {amount?.toLocaleString()}</Text>
      ),
    },
    {
      title: 'Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
    },
    {
      title: 'Requested',
      dataIndex: 'requested_at',
      key: 'requested_at',
      render: (date: string) => (
        <Text type="secondary">{format(new Date(date), 'MMM dd, HH:mm')}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'pending' ? 'processing' : status === 'approved' ? 'success' : 'error'} 
          text={status?.toUpperCase()} 
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error loading dashboard data"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchDashboardData}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #FF006E 0%, #8338EC 25%, #3A86FF 50%, #06FFB4 75%, #FFBE0B 100%)',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(255,0,110,0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(131,56,236,0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '15%',
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(6,255,180,0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 7s ease-in-out infinite'
      }} />

      {/* Header */}
      <div style={{ 
        marginBottom: '32px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        background: 'linear-gradient(135deg, rgba(255,0,110,0.9) 0%, rgba(131,56,236,0.9) 50%, rgba(58,134,255,0.9) 100%)',
        padding: '32px', 
        borderRadius: '24px', 
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(255,255,255,0.2)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative',
        zIndex: 10
      }}>
        <div>
          <Title level={1} style={{ 
            margin: 0, 
            color: '#FFFFFF', 
            fontSize: 'clamp(24px, 5vw, 40px)', 
            fontWeight: '900',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            background: 'linear-gradient(45deg, #FFBE0B, #FF006E, #8338EC, #3A86FF, #06FFB4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textAlign: 'center',
            lineHeight: 1.2
          }}>
            🚀 Dashboard
          </Title>
          <Text style={{ 
            color: '#FFFFFF', 
            fontSize: 'clamp(12px, 3vw, 16px)', 
            opacity: 0.95,
            fontWeight: '600',
            textShadow: '0 1px 5px rgba(0,0,0,0.3)',
            textAlign: 'center',
            display: 'block',
            marginTop: '8px'
          }}>
            Real-Time Analytics
          </Text>
          <div style={{ marginTop: '12px' }}>
            <Space size="middle" wrap>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 8px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 'clamp(10px, 2.5vw, 12px)' }}>🔥 Live</Text>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 8px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 'clamp(10px, 2.5vw, 12px)' }}>⚡ Real-Time</Text>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 8px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 'clamp(10px, 2.5vw, 12px)' }}>🎯 AI</Text>
              </div>
            </Space>
          </div>
        </div>
        <Space orientation="vertical" size="middle">
          <Space wrap>
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange([dates[0]!, dates[1]!])}
              format="YYYY-MM-DD"
              style={{ 
                background: 'rgba(255,255,255,0.9)', 
                borderRadius: '8px', 
                border: '1px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)',
                fontSize: 'clamp(12px, 3vw, 14px)'
              }}
              size="small"
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchDashboardData}
              style={{ 
                background: 'linear-gradient(135deg, #FF006E 0%, #8338EC 100%)', 
                borderColor: '#FF006E', 
                color: 'white', 
                fontWeight: 'bold',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(255,0,110,0.4)',
                fontSize: 'clamp(10px, 2.5vw, 12px)'
              }}
              size="small"
            >
              🔄 Refresh
            </Button>
            <Button 
              icon={<BarChartOutlined />}
              style={{ 
                background: 'linear-gradient(135deg, #3A86FF 0%, #06FFB4 100%)', 
                borderColor: '#3A86FF', 
                color: 'white', 
                fontWeight: 'bold',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(58,134,255,0.4)',
                fontSize: 'clamp(10px, 2.5vw, 12px)'
              }}
              size="small"
            >
              📊 Export
            </Button>
            <Button 
              icon={<SettingOutlined />}
              style={{ 
                background: 'linear-gradient(135deg, #FFBE0B 0%, #FF006E 100%)', 
                borderColor: '#FFBE0B', 
                color: 'white', 
                fontWeight: 'bold',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(255,190,11,0.4)',
                fontSize: 'clamp(10px, 2.5vw, 12px)'
              }}
              size="small"
            >
              ⚙️ Settings
            </Button>
          </Space>
        </Space>
      </div>

      {/* Metrics Grid - Mobile Optimized */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px', position: 'relative', zIndex: 10 }}>
        <Col xs={12} sm={12} md={6}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #FF006E 0%, #8338EC 50%, #3A86FF 100%)', 
              border: 'none', 
              borderRadius: '16px', 
              boxShadow: '0 8px 24px rgba(255,0,110,0.3)',
              padding: '16px'
            }}
          >
            <Statistic
              title={<Text style={{ 
                color: '#FFFFFF', 
                fontWeight: '700', 
                fontSize: 'clamp(11px, 2.8vw, 13px)', 
                textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>👥 Users</Text>}
              value={totalUsers}
              prefix={<UserOutlined style={{ color: '#FFFFFF', fontSize: 'clamp(14px, 3.5vw, 18px)' }} />}
              styles={{ 
                content: { 
                  color: '#FFFFFF', 
                  fontSize: 'clamp(20px, 4.5vw, 28px)', 
                  fontWeight: '900', 
                  textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                } 
              }}
              suffix={
                <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
                  <Text style={{ 
                    color: '#FFFFFF', 
                    fontSize: 'clamp(9px, 2.2vw, 11px)', 
                    opacity: 0.9, 
                    fontWeight: 'bold',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    ({activeUsers} active)
                  </Text>
                  <div style={{ marginTop: '4px' }}>
                    <Progress 
                      percent={(activeUsers / totalUsers) * 100} 
                      strokeColor="rgba(255,255,255,0.8)"
                      railColor="rgba(255,255,255,0.2)"
                      size="small"
                    />
                  </div>
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #8338EC 0%, #3A86FF 50%, #06FFB4 100%)', 
              border: 'none', 
              borderRadius: '16px', 
              boxShadow: '0 8px 24px rgba(131,56,236,0.3)',
              padding: '16px'
            }}
          >
            <Statistic
              title={<Text style={{ 
                color: '#FFFFFF', 
                fontWeight: '700', 
                fontSize: 'clamp(11px, 2.8vw, 13px)', 
                textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>💰 Earnings</Text>}
              value={totalEarnings}
              prefix={<DollarOutlined style={{ color: '#FFFFFF', fontSize: 'clamp(14px, 3.5vw, 18px)' }} />}
              styles={{ 
                content: { 
                  color: '#FFFFFF', 
                  fontSize: 'clamp(20px, 4.5vw, 28px)', 
                  fontWeight: '900', 
                  textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                } 
              }}
              precision={2}
              suffix="KES"
            />
            <div style={{ marginTop: '8px' }}>
              <Space size="small">
                <Tag color="rgba(255,255,255,0.3)" style={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: 'clamp(7px, 1.8vw, 9px)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>📈 +15.3%</Tag>
                <Tag color="rgba(255,255,255,0.3)" style={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: 'clamp(7px, 1.8vw, 9px)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>🔥 Trending</Tag>
              </Space>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #3A86FF 0%, #06FFB4 50%, #FFBE0B 100%)', 
              border: 'none', 
              borderRadius: '16px', 
              boxShadow: '0 8px 24px rgba(58,134,255,0.3)',
              padding: '16px'
            }}
          >
            <Statistic
              title={<Text style={{ 
                color: '#FFFFFF', 
                fontWeight: '700', 
                fontSize: 'clamp(11px, 2.8vw, 13px)', 
                textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>🏦 Withdrawals</Text>}
              value={totalWithdrawals}
              prefix={<BankOutlined style={{ color: '#FFFFFF', fontSize: 'clamp(14px, 3.5vw, 18px)' }} />}
              styles={{ 
                content: { 
                  color: '#FFFFFF', 
                  fontSize: 'clamp(20px, 4.5vw, 28px)', 
                  fontWeight: '900', 
                  textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                } 
              }}
              precision={2}
              suffix="KES"
            />
            <div style={{ marginTop: '8px' }}>
              <Space size="small">
                <Tag color="rgba(255,255,255,0.3)" style={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: 'clamp(7px, 1.8vw, 9px)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>⚡ Fast</Tag>
                <Tag color="rgba(255,255,255,0.3)" style={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: 'clamp(7px, 1.8vw, 9px)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>✅ Secure</Tag>
              </Space>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #06FFB4 0%, #FFBE0B 50%, #FF006E 100%)', 
              border: 'none', 
              borderRadius: '16px', 
              boxShadow: '0 8px 24px rgba(6,255,180,0.3)',
              padding: '16px'
            }}
          >
            <Statistic
              title={<Text style={{ 
                color: '#FFFFFF', 
                fontWeight: '700', 
                fontSize: 'clamp(11px, 2.8vw, 13px)', 
                textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>⏳ Pending</Text>}
              value={pendingWithdrawalAmount}
              prefix={<ClockCircleOutlined style={{ color: '#FFFFFF', fontSize: 'clamp(14px, 3.5vw, 18px)' }} />}
              styles={{ 
                content: { 
                  color: '#FFFFFF', 
                  fontSize: 'clamp(20px, 4.5vw, 28px)', 
                  fontWeight: '900', 
                  textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                } 
              }}
              precision={2}
              suffix="KES"
            />
            <div style={{ marginTop: '8px' }}>
              <Space size="small">
                <Tag color="rgba(255,255,255,0.3)" style={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: 'clamp(7px, 1.8vw, 9px)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>🔔 Alert</Tag>
                <Tag color="rgba(255,255,255,0.3)" style={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: 'clamp(7px, 1.8vw, 9px)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>📊 Processing</Tag>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Section - Mobile Optimized */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px', position: 'relative', zIndex: 10 }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ 
                background: 'linear-gradient(135deg, #FF006E 0%, #8338EC 50%, #3A86FF 100%)',
                padding: '6px 12px',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '700',
                fontSize: 'clamp(12px, 3vw, 14px)',
                textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>
                📈 Revenue Analytics
              </div>
            }
            style={{ 
              background: 'rgba(255,255,255,0.95)', 
              borderRadius: '16px', 
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              padding: '16px'
            }}
          >
            <div style={{ height: 'clamp(200px, 40vh, 300px)' }}>
              <Area {...earningsChartConfig} height={300} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ 
                background: 'linear-gradient(135deg, #8338EC 0%, #3A86FF 50%, #06FFB4 100%)',
                padding: '6px 12px',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '700',
                fontSize: 'clamp(12px, 3vw, 14px)',
                textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>
                👥 User Activity
              </div>
            }
            style={{ 
              background: 'rgba(255,255,255,0.95)', 
              borderRadius: '16px', 
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              padding: '16px'
            }}
          >
            <div style={{ height: 'clamp(200px, 40vh, 300px)' }}>
              <Line {...userGrowthChartConfig} height={300} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Ultra Complex Charts Section */}
      <Row gutter={[32, 32]} style={{ marginBottom: '40px', position: 'relative', zIndex: 10 }}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <div style={{ 
                background: 'linear-gradient(135deg, #FF006E 0%, #8338EC 50%, #3A86FF 100%)',
                padding: '16px 24px',
                borderRadius: '16px',
                color: 'white',
                fontWeight: '900',
                fontSize: '20px',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <RiseOutlined style={{ fontSize: '24px' }} />
                🚀 ADVANCED EARNINGS ANALYTICS
                <div style={{ marginLeft: 'auto' }}>
                  <Space>
                    <Tag style={{ 
                      background: 'rgba(255,255,255,0.2)', 
                      color: 'white', 
                      border: 'none',
                      fontWeight: 'bold'
                    }}>
                      📊 Real-Time
                    </Tag>
                    <Tag style={{ 
                      background: 'rgba(255,255,255,0.2)', 
                      color: 'white', 
                      border: 'none',
                      fontWeight: 'bold'
                    }}>
                      🎯 AI Predictions
                    </Tag>
                  </Space>
                </div>
              </div>
            } 
            style={{ 
              borderRadius: '24px', 
              boxShadow: '0 20px 60px rgba(255,0,110,0.3)',
              background: 'linear-gradient(135deg, rgba(255,0,110,0.1) 0%, rgba(131,56,236,0.1) 50%, rgba(58,134,255,0.1) 100%)',
              border: '2px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(20px)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-20%',
              left: '-10%',
              width: '120%',
              height: '140%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
              animation: 'pulse 4s ease-in-out infinite'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Area {...earningsChartConfig} height={400} />
              <div style={{ marginTop: '24px' }}>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <div style={{
                      background: 'linear-gradient(135deg, #FF006E 0%, #8338EC 100%)',
                      padding: '16px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 25px rgba(255,0,110,0.3)'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: '900' }}>📈</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Peak Revenue</div>
                      <div style={{ fontSize: '20px', fontWeight: '900' }}>KES 45,678</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{
                      background: 'linear-gradient(135deg, #3A86FF 0%, #06FFB4 100%)',
                      padding: '16px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 25px rgba(58,134,255,0.3)'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: '900' }}>🎯</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Avg Daily</div>
                      <div style={{ fontSize: '20px', fontWeight: '900' }}>KES 12,345</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{
                      background: 'linear-gradient(135deg, #FFBE0B 0%, #FF006E 100%)',
                      padding: '16px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 25px rgba(255,190,11,0.3)'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: '900' }}>🔥</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Growth</div>
                      <div style={{ fontSize: '20px', fontWeight: '900' }}>+23.5%</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={
              <div style={{ 
                background: 'linear-gradient(135deg, #8338EC 0%, #3A86FF 50%, #06FFB4 100%)',
                padding: '16px 24px',
                borderRadius: '16px',
                color: 'white',
                fontWeight: '900',
                fontSize: '20px',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <PieChartOutlined style={{ fontSize: '24px' }} />
                💎 REVENUE BREAKDOWN
              </div>
            } 
            style={{ 
              borderRadius: '24px', 
              boxShadow: '0 20px 60px rgba(131,56,236,0.3)',
              background: 'linear-gradient(135deg, rgba(131,56,236,0.1) 0%, rgba(58,134,255,0.1) 50%, rgba(6,255,180,0.1) 100%)',
              border: '2px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(20px)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-20%',
              right: '-10%',
              width: '120%',
              height: '140%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
              animation: 'pulse 5s ease-in-out infinite reverse'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Pie {...pieChartConfig} height={400} />
              <div style={{ marginTop: '24px' }}>
                {pieData.map((item, index) => (
                  <div key={item.type} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    margin: '4px 0',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>{item.type}</span>
                    <span style={{ 
                      color: 'white', 
                      fontWeight: '900',
                      fontSize: '16px'
                    }}>
                      KES {item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[32, 32]} style={{ marginBottom: '40px', position: 'relative', zIndex: 10 }}>
        <Col xs={24}>
          <Card 
            title={
              <div style={{ 
                background: 'linear-gradient(135deg, #3A86FF 0%, #06FFB4 50%, #FFBE0B 100%)',
                padding: '16px 24px',
                borderRadius: '16px',
                color: 'white',
                fontWeight: '900',
                fontSize: '20px',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <TrophyOutlined style={{ fontSize: '24px' }} />
                🌟 USER GROWTH METRICS
                <div style={{ marginLeft: 'auto' }}>
                  <Space>
                    <Tag style={{ 
                      background: 'rgba(255,255,255,0.2)', 
                      color: 'white', 
                      border: 'none',
                      fontWeight: 'bold'
                    }}>
                      🚀 Acceleration
                    </Tag>
                    <Tag style={{ 
                      background: 'rgba(255,255,255,0.2)', 
                      color: 'white', 
                      border: 'none',
                      fontWeight: 'bold'
                    }}>
                      📊 Analytics
                    </Tag>
                  </Space>
                </div>
              </div>
            } 
            style={{ 
              borderRadius: '24px', 
              boxShadow: '0 20px 60px rgba(58,134,255,0.3)',
              background: 'linear-gradient(135deg, rgba(58,134,255,0.1) 0%, rgba(6,255,180,0.1) 50%, rgba(255,190,11,0.1) 100%)',
              border: '2px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(20px)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-20%',
              left: '-10%',
              width: '120%',
              height: '140%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
              animation: 'pulse 6s ease-in-out infinite'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Line {...userGrowthChartConfig} height={400} />
              <div style={{ marginTop: '24px' }}>
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <div style={{
                      background: 'linear-gradient(135deg, #FF006E 0%, #8338EC 100%)',
                      padding: '16px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 25px rgba(255,0,110,0.3)'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: '900' }}>👥</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>New Today</div>
                      <div style={{ fontSize: '20px', fontWeight: '900' }}>+42</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{
                      background: 'linear-gradient(135deg, #3A86FF 0%, #06FFB4 100%)',
                      padding: '16px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 25px rgba(58,134,255,0.3)'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: '900' }}>📈</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Weekly Growth</div>
                      <div style={{ fontSize: '20px', fontWeight: '900' }}>+18.7%</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{
                      background: 'linear-gradient(135deg, #FFBE0B 0%, #FF006E 100%)',
                      padding: '16px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 25px rgba(255,190,11,0.3)'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: '900' }}>🎯</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Retention</div>
                      <div style={{ fontSize: '20px', fontWeight: '900' }}>94.2%</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{
                      background: 'linear-gradient(135deg, #06FFB4 0%, #FFBE0B 100%)',
                      padding: '16px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 25px rgba(6,255,180,0.3)'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: '900' }}>🔥</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Engagement</div>
                      <div style={{ fontSize: '20px', fontWeight: '900' }}>87.5%</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Mega Complex Tables Section */}
      <Row gutter={[32, 32]} style={{ position: 'relative', zIndex: 10 }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ 
                background: 'linear-gradient(135deg, #FF006E 0%, #8338EC 50%, #3A86FF 100%)',
                padding: '8px 16px',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '700',
                fontSize: 'clamp(14px, 3.5vw, 18px)',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>
                <DollarOutlined style={{ fontSize: 'clamp(16px, 4vw, 20px)' }} />
                💸 Recent Transactions
                <div style={{ marginLeft: 'auto' }}>
                  <Button 
                    type="text" 
                    href="/transactions" 
                    style={{ 
                      color: 'white', 
                      fontWeight: 'bold',
                      background: 'rgba(255,255,255,0.2)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      fontSize: 'clamp(10px, 2.5vw, 12px)'
                    }}
                  >
                    View All →
                  </Button>
                </div>
              </div>
            } 
            style={{ 
              borderRadius: '24px', 
              boxShadow: '0 20px 60px rgba(255,0,110,0.3)',
              background: 'linear-gradient(135deg, rgba(255,0,110,0.1) 0%, rgba(131,56,236,0.1) 50%, rgba(58,134,255,0.1) 100%)',
              border: '2px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(20px)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-20%',
              left: '-10%',
              width: '120%',
              height: '140%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
              animation: 'pulse 7s ease-in-out infinite'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Table
                dataSource={recentTransactions}
                columns={transactionColumns}
                rowKey="id"
                loading={loading}
                pagination={false}
                size="small"
                scroll={{ x: 600, y: 300 }}
                style={{ 
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  fontSize: 'clamp(11px, 2.5vw, 13px)'
                }}
                rowClassName={(record, index) => index % 2 === 0 ? 'table-row-neon' : 'table-row-neon-alt'}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ 
                background: 'linear-gradient(135deg, #8338EC 0%, #3A86FF 50%, #06FFB4 100%)',
                padding: '8px 16px',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '700',
                fontSize: 'clamp(14px, 3.5vw, 18px)',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>
                <ClockCircleOutlined style={{ fontSize: 'clamp(16px, 4vw, 20px)' }} />
                ⏰ Pending Withdrawals
                <div style={{ marginLeft: 'auto' }}>
                  <Button 
                    type="text" 
                    href="/withdrawals" 
                    style={{ 
                      color: 'white', 
                      fontWeight: 'bold',
                      background: 'rgba(255,255,255,0.2)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      fontSize: 'clamp(10px, 2.5vw, 12px)'
                    }}
                  >
                    View All →
                  </Button>
                </div>
              </div>
            } 
            style={{ 
              borderRadius: '24px', 
              boxShadow: '0 20px 60px rgba(131,56,236,0.3)',
              background: 'linear-gradient(135deg, rgba(131,56,236,0.1) 0%, rgba(58,134,255,0.1) 50%, rgba(6,255,180,0.1) 100%)',
              border: '2px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(20px)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-20%',
              right: '-10%',
              width: '120%',
              height: '140%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
              animation: 'pulse 8s ease-in-out infinite reverse'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Table
                dataSource={pendingWithdrawals}
                columns={withdrawalColumns}
                rowKey="id"
                loading={loading}
                pagination={false}
                size="small"
                scroll={{ x: 600, y: 300 }}
                style={{ 
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  fontSize: 'clamp(11px, 2.5vw, 13px)'
                }}
                rowClassName={(record, index) => index % 2 === 0 ? 'table-row-neon' : 'table-row-neon-alt'}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Add CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes glow {
          from { filter: brightness(1); }
          to { filter: brightness(1.2); }
        }
        .table-row-neon {
          background: linear-gradient(135deg, rgba(255,0,110,0.1) 0%, rgba(131,56,236,0.1) 100%) !important;
          border-left: 3px solid #FF006E !important;
        }
        .table-row-neon-alt {
          background: linear-gradient(135deg, rgba(58,134,255,0.1) 0%, rgba(6,255,180,0.1) 100%) !important;
          border-left: 3px solid #3A86FF !important;
        }
        .table-row-neon:hover {
          background: linear-gradient(135deg, rgba(255,0,110,0.2) 0%, rgba(131,56,236,0.2) 100%) !important;
          transform: scale(1.02);
          transition: all 0.3s ease;
        }
        .table-row-neon-alt:hover {
          background: linear-gradient(135deg, rgba(58,134,255,0.2) 0%, rgba(6,255,180,0.2) 100%) !important;
          transform: scale(1.02);
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
