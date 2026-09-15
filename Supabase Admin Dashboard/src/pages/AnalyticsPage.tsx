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
  Badge,
  Tabs,
  Timeline,
  Calendar
} from 'antd';
import {
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  BankOutlined,
  UserOutlined,
  GiftOutlined,
  StarOutlined,
  CrownOutlined,
  FireOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  HeartOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import {
  Line,
  Column,
  Pie,
  Area,
  DualAxes,
  Gauge,
  Radar,
  Scatter,
  Heatmap,
  Stock,
  Liquid,
  WordCloud,
  Funnel,
  Treemap,
  Sunburst,
  Box,
  Violin,
  Histogram,
  Bullet,
  Rose
} from '@ant-design/plots';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { supabase } from '../lib/supabase';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

interface AnalyticsData {
  dailyRevenue: Array<{ date: string; revenue: number; expenses: number; profit: number }>;
  userGrowth: Array<{ date: string; newUsers: number; activeUsers: number; totalUsers: number }>;
  incomeBreakdown: Array<{ source: string; amount: number; percentage: number }>;
  topPerformers: Array<{ name: string; email: string; earnings: number; tasks: number; level: number }>;
  transactionVolume: Array<{ hour: string; volume: number; count: number }>;
  geographicData: Array<{ region: string; users: number; revenue: number }>;
  investmentReturns: Array<{ date: string; principal: number; returns: number; rate: number }>;
  referralNetwork: Array<{ level: number; count: number; earnings: number }>;
  taskCompletion: Array<{ task: string; completions: number; earnings: number; avgTime: number }>;
  giftCodeUsage: Array<{ code: string; uses: number; rewards: number; date: string }>;
}

const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    dailyRevenue: [],
    userGrowth: [],
    incomeBreakdown: [],
    topPerformers: [],
    transactionVolume: [],
    geographicData: [],
    investmentReturns: [],
    referralNetwork: [],
    taskCompletion: [],
    giftCodeUsage: []
  });
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for now to prevent infinite loading
      const mockData: AnalyticsData = {
        dailyRevenue: [
          { date: 'Jan 01', revenue: 45000, expenses: 12000, profit: 33000 },
          { date: 'Jan 02', revenue: 52000, expenses: 15000, profit: 37000 },
          { date: 'Jan 03', revenue: 48000, expenses: 13000, profit: 35000 },
          { date: 'Jan 04', revenue: 61000, expenses: 18000, profit: 43000 },
          { date: 'Jan 05', revenue: 55000, expenses: 16000, profit: 39000 },
        ],
        userGrowth: [
          { date: 'Jan 01', newUsers: 45, activeUsers: 230, totalUsers: 1250 },
          { date: 'Jan 02', newUsers: 52, activeUsers: 245, totalUsers: 1302 },
          { date: 'Jan 03', newUsers: 38, activeUsers: 228, totalUsers: 1340 },
          { date: 'Jan 04', newUsers: 61, activeUsers: 267, totalUsers: 1401 },
          { date: 'Jan 05', newUsers: 47, activeUsers: 251, totalUsers: 1448 },
        ],
        incomeBreakdown: [
          { source: 'Task Earnings', amount: 125000, percentage: 45 },
          { source: 'Referral Earnings', amount: 45000, percentage: 16 },
          { source: 'Spin Wins', amount: 35000, percentage: 13 },
          { source: 'Gift Codes', amount: 25000, percentage: 9 },
          { source: 'Investment Returns', amount: 48000, percentage: 17 }
        ],
        topPerformers: [
          { name: 'John Doe', email: 'john@example.com', earnings: 12500, tasks: 45, level: 12 },
          { name: 'Jane Smith', email: 'jane@example.com', earnings: 11200, tasks: 42, level: 11 },
          { name: 'Mike Johnson', email: 'mike@example.com', earnings: 10800, tasks: 38, level: 10 },
          { name: 'Sarah Wilson', email: 'sarah@example.com', earnings: 9800, tasks: 35, level: 9 },
          { name: 'Tom Brown', email: 'tom@example.com', earnings: 9200, tasks: 33, level: 9 },
        ],
        transactionVolume: [
          { hour: '00:00', volume: 2500, count: 12 },
          { hour: '06:00', volume: 4800, count: 23 },
          { hour: '12:00', volume: 8900, count: 41 },
          { hour: '18:00', volume: 7200, count: 34 },
          { hour: '23:00', volume: 3100, count: 15 },
        ],
        geographicData: [
          { region: 'Nairobi', users: 450, revenue: 125000 },
          { region: 'Mombasa', users: 280, revenue: 78000 },
          { region: 'Kisumu', users: 190, revenue: 52000 },
          { region: 'Nakuru', users: 150, revenue: 41000 },
        ],
        investmentReturns: [
          { date: 'Jan 01', principal: 10000, returns: 450, rate: 4.5 },
          { date: 'Jan 02', principal: 15000, returns: 680, rate: 4.5 },
          { date: 'Jan 03', principal: 8000, returns: 320, rate: 4.0 },
          { date: 'Jan 04', principal: 20000, returns: 920, rate: 4.6 },
          { date: 'Jan 05', principal: 12000, returns: 540, rate: 4.5 },
        ],
        referralNetwork: [
          { level: 1, count: 1250, earnings: 45000 },
          { level: 2, count: 340, earnings: 12000 },
          { level: 3, count: 89, earnings: 3500 },
          { level: 4, count: 23, earnings: 980 },
        ],
        taskCompletion: [
          { task: 'Surveys', completions: 145, earnings: 7250, avgTime: 4.5 },
          { task: 'Videos', completions: 89, earnings: 2225, avgTime: 2.1 },
          { task: 'Games', completions: 67, earnings: 6700, avgTime: 6.8 },
          { task: 'Downloads', completions: 34, earnings: 2550, avgTime: 1.2 },
        ],
        giftCodeUsage: [
          { code: 'WELCOME50', uses: 145, rewards: 7250, date: 'Jan 01' },
          { code: 'SPECIAL25', uses: 89, rewards: 2225, date: 'Jan 02' },
          { code: 'BONUS100', uses: 67, rewards: 6700, date: 'Jan 03' },
          { code: 'HOLIDAY75', uses: 34, rewards: 2550, date: 'Jan 04' },
        ]
      };

      setAnalyticsData(mockData);

    } catch (err) {
      console.error('Analytics data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  // Chart configurations with beautiful colors
  const revenueChartConfig = {
    data: analyticsData.dailyRevenue,
    xField: 'date',
    yField: 'revenue',
    seriesField: 'type',
    smooth: true,
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
    point: { size: 4, shape: 'circle' },
    tooltip: {
      formatter: (datum: any) => ({
        name: datum.type,
        value: `KES ${datum.value?.toLocaleString()}`,
      }),
    },
  };

  const userGrowthConfig = {
    data: analyticsData.userGrowth,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: ['#6C5CE7', '#00B894', '#FDCB6E', '#E17055', '#74B9FF'],
    point: { size: 4 },
  };

  const incomeBreakdownConfig = {
    data: analyticsData.incomeBreakdown,
    angleField: 'amount',
    colorField: 'source',
    radius: 0.8,
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  const transactionVolumeConfig = {
    data: analyticsData.transactionVolume,
    xField: 'hour',
    yField: 'volume',
    color: '#FF6B6B',
    columnWidthRatio: 0.8,
    meta: {
      volume: { alias: 'Transaction Volume (KES)' },
      hour: { alias: 'Hour of Day' },
    },
  };

  const geographicConfig = {
    data: analyticsData.geographicData,
    xField: 'region',
    yField: 'revenue',
    color: '#4ECDC4',
    columnWidthRatio: 0.6,
    meta: {
      revenue: { alias: 'Revenue (KES)' },
      region: { alias: 'Region' },
    },
  };

  const investmentReturnsConfig = {
    data: analyticsData.investmentReturns,
    xField: 'date',
    yField: 'returns',
    color: '#45B7D1',
    point: { size: 3 },
    smooth: true,
  };

  const referralNetworkConfig = {
    data: analyticsData.referralNetwork,
    xField: 'level',
    yField: 'earnings',
    color: '#96CEB4',
    columnWidthRatio: 0.6,
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px', color: 'white' }}>Loading comprehensive analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', minHeight: '100vh' }}>
        <Alert
          message="Error loading analytics data"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={fetchAnalyticsData}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <Title level={1} style={{ color: 'white', margin: 0, fontSize: '48px', fontWeight: 'bold' }}>
          🚀 Advanced Analytics Dashboard
        </Title>
        <Text style={{ color: 'white', fontSize: '18px' }}>Comprehensive insights into your platform performance</Text>
        <div style={{ marginTop: '16px' }}>
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange([dates[0]!, dates[1]!])}
            format="YYYY-MM-DD"
            style={{ background: 'white', borderRadius: '8px' }}
          />
          <Button 
            type="primary" 
            icon={<RocketOutlined />} 
            onClick={fetchAnalyticsData}
            style={{ marginLeft: '12px', background: '#FF6B6B', borderColor: '#FF6B6B' }}
          >
            Refresh Analytics
          </Button>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ background: 'white', borderRadius: '16px', padding: '24px' }}>
        <TabPane tab={<span><TrophyOutlined style={{ color: '#FF6B6B' }} /> Overview</span>} key="overview">
          {/* Key Metrics */}
          <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', border: 'none', borderRadius: '16px' }}>
                <Statistic
                  title={<Text style={{ color: 'white', fontWeight: 'bold' }}>Total Revenue</Text>}
                  value={analyticsData.dailyRevenue.reduce((sum, d) => sum + d.revenue, 0)}
                  prefix={<DollarOutlined style={{ color: 'white' }} />}
                  valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
                  suffix="KES"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)', border: 'none', borderRadius: '16px' }}>
                <Statistic
                  title={<Text style={{ color: 'white', fontWeight: 'bold' }}>Net Profit</Text>}
                  value={analyticsData.dailyRevenue.reduce((sum, d) => sum + d.profit, 0)}
                  prefix={<RiseOutlined style={{ color: 'white' }} />}
                  valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
                  suffix="KES"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ background: 'linear-gradient(135deg, #45B7D1 0%, #2196F3 100%)', border: 'none', borderRadius: '16px' }}>
                <Statistic
                  title={<Text style={{ color: 'white', fontWeight: 'bold' }}>Active Users</Text>}
                  value={analyticsData.userGrowth[analyticsData.userGrowth.length - 1]?.activeUsers || 0}
                  prefix={<UserOutlined style={{ color: 'white' }} />}
                  valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ background: 'linear-gradient(135deg, #96CEB4 0%, #88D8B0 100%)', border: 'none', borderRadius: '16px' }}>
                <Statistic
                  title={<Text style={{ color: 'white', fontWeight: 'bold' }}>Total Transactions</Text>}
                  value={analyticsData.transactionVolume.reduce((sum, d) => sum + d.count, 0)}
                  prefix={<BankOutlined style={{ color: 'white' }} />}
                  valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card title={<span><RiseOutlined style={{ color: '#FF6B6B' }} /> Revenue Trends</span>} style={{ borderRadius: '16px' }}>
                <Area {...revenueChartConfig} height={400} />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title={<span><PieChartOutlined style={{ color: '#4ECDC4' }} /> Income Sources</span>} style={{ borderRadius: '16px' }}>
                <Pie {...incomeBreakdownConfig} height={400} />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><UserOutlined style={{ color: '#45B7D1' }} /> User Analytics</span>} key="users">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title={<span><TrophyOutlined style={{ color: '#FF6B6B' }} /> User Growth</span>} style={{ borderRadius: '16px' }}>
                <Line {...userGrowthConfig} height={350} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title={<span><CrownOutlined style={{ color: '#4ECDC4' }} /> Top Performers</span>} style={{ borderRadius: '16px' }}>
                <List
                  dataSource={analyticsData.topPerformers}
                  renderItem={(user, index) => (
                    <List.Item style={{ background: index % 2 === 0 ? '#F8F9FA' : 'white', borderRadius: '8px', marginBottom: '8px' }}>
                      <List.Item.Meta
                        avatar={<Avatar style={{ background: '#FF6B6B' }}>{index + 1}</Avatar>}
                        title={<Text style={{ color: '#333', fontWeight: 'bold' }}>{user.name}</Text>}
                        description={
                          <div>
                            <Text type="secondary">{user.email}</Text><br />
                            <Text style={{ color: '#4ECDC4', fontWeight: 'bold' }}>KES {user.earnings.toLocaleString()}</Text>
                            <Tag color="blue" style={{ marginLeft: '8px' }}>Level {user.level}</Tag>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><BankOutlined style={{ color: '#96CEB4' }} /> Financial Analytics</span>} key="financial">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title={<span><ClockCircleOutlined style={{ color: '#FF6B6B' }} /> Transaction Volume by Hour</span>} style={{ borderRadius: '16px' }}>
                <Column {...transactionVolumeConfig} height={350} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title={<span><ThunderboltOutlined style={{ color: '#4ECDC4' }} /> Investment Returns</span>} style={{ borderRadius: '16px' }}>
                <Line {...investmentReturnsConfig} height={350} />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><GiftOutlined style={{ color: '#FFEAA7' }} /> Marketing Analytics</span>} key="marketing">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title={<span><StarOutlined style={{ color: '#FF6B6B' }} /> Referral Network</span>} style={{ borderRadius: '16px' }}>
                <Column {...referralNetworkConfig} height={350} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title={<span><HeartOutlined style={{ color: '#4ECDC4' }} /> Gift Code Usage</span>} style={{ borderRadius: '16px' }}>
                <List
                  dataSource={analyticsData.giftCodeUsage}
                  renderItem={(gift, index) => (
                    <List.Item style={{ background: index % 2 === 0 ? '#F8F9FA' : 'white', borderRadius: '8px', marginBottom: '8px' }}>
                      <List.Item.Meta
                        avatar={<Avatar style={{ background: '#FFEAA7', color: '#333' }}>{gift.code.substring(0, 2).toUpperCase()}</Avatar>}
                        title={<Text style={{ color: '#333', fontWeight: 'bold' }}>{gift.code}</Text>}
                        description={
                          <div>
                            <Text type="secondary">{gift.date}</Text><br />
                            <Text style={{ color: '#4ECDC4', fontWeight: 'bold' }}>KES {gift.rewards.toLocaleString()}</Text>
                            <Tag color="orange" style={{ marginLeft: '8px' }}>{gift.uses} uses</Tag>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
