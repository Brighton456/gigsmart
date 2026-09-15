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
  Switch,
  Slider,
  InputNumber,
  Input,
  Modal,
  Drawer,
  Rate,
  Progress as AntProgress,
  Segmented,
  Tree,
  AutoComplete,
  Cascader,
  Transfer,
  Upload,
  message
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
  TrophyOutlined,
  StarOutlined,
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
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  BankOutlined,
  GiftOutlined,
  SmileOutlined,
  FrownOutlined,
  MehOutlined,
  LikeOutlined,
  DislikeOutlined,
  PlusOutlined,
  MinusOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ExportOutlined,
  ImportOutlined,
  SyncOutlined,
  ReloadOutlined,
  SettingOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  SafetyOutlined,
  SecurityScanOutlined,
  AuditOutlined,
  MonitorOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  AreaChartOutlined
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
  Sankey,
  Treemap,
  Sunburst,
  Box,
  Violin,
  Histogram
} from '@ant-design/plots';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { supabase } from '../lib/supabase';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;

interface UserAnalyticsData {
  userGrowth: Array<{ date: string; newUsers: number; activeUsers: number; totalUsers: number }>;
  userSegments: Array<{ segment: string; count: number; percentage: number; avgEarnings: number }>;
  userActivity: Array<{ hour: string; activeUsers: number; tasksCompleted: number }>;
  userRetention: Array<{ period: string; retained: number; percentage: number }>;
  userEarnings: Array<{ range: string; count: number; percentage: number }>;
  referralNetwork: Array<{ level: number; count: number; earnings: number }>;
  userDemographics: Array<{ ageGroup: string; count: number; percentage: number }>;
  topPerformers: Array<{ name: string; email: string; earnings: number; tasks: number; level: number; joinDate: string; lastActive: string }>;
}

const UsersAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAnalyticsData, setUserAnalyticsData] = useState<UserAnalyticsData>({
    userGrowth: [],
    userSegments: [],
    userActivity: [],
    userRetention: [],
    userEarnings: [],
    referralNetwork: [],
    userDemographics: [],
    topPerformers: []
  });

  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');

  const fetchUserAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for now to prevent infinite loading
      const mockData = {
        userGrowth: [
          { date: 'Jan 01', newUsers: 45, activeUsers: 230, totalUsers: 1250 },
          { date: 'Jan 02', newUsers: 52, activeUsers: 245, totalUsers: 1302 },
          { date: 'Jan 03', newUsers: 38, activeUsers: 228, totalUsers: 1340 },
          { date: 'Jan 04', newUsers: 61, activeUsers: 267, totalUsers: 1401 },
          { date: 'Jan 05', newUsers: 47, activeUsers: 251, totalUsers: 1448 },
        ],
        userSegments: [
          { segment: 'New Users', count: 450, percentage: 31, avgEarnings: 2500 },
          { segment: 'Active Users', count: 680, percentage: 47, avgEarnings: 8500 },
          { segment: 'Premium Users', count: 220, percentage: 15, avgEarnings: 15600 },
          { segment: 'Inactive Users', count: 98, percentage: 7, avgEarnings: 800 },
        ],
        topPerformers: [
          { name: 'John Doe', email: 'john@example.com', earnings: 12500, tasks: 45, level: 12, joinDate: '2024-01-15', lastActive: '2025-01-08' },
          { name: 'Jane Smith', email: 'jane@example.com', earnings: 11200, tasks: 42, level: 11, joinDate: '2024-02-20', lastActive: '2025-01-07' },
          { name: 'Mike Johnson', email: 'mike@example.com', earnings: 10800, tasks: 38, level: 10, joinDate: '2024-01-10', lastActive: '2025-01-08' },
          { name: 'Sarah Wilson', email: 'sarah@example.com', earnings: 9800, tasks: 35, level: 9, joinDate: '2024-03-05', lastActive: '2025-01-06' },
          { name: 'Tom Brown', email: 'tom@example.com', earnings: 9200, tasks: 33, level: 9, joinDate: '2024-01-25', lastActive: '2025-01-08' },
        ],
        userActivity: [
          { hour: '00:00', activeUsers: 45, tasksCompleted: 12 },
          { hour: '06:00', activeUsers: 89, tasksCompleted: 34 },
          { hour: '12:00', activeUsers: 234, tasksCompleted: 89 },
          { hour: '18:00', activeUsers: 187, tasksCompleted: 67 },
          { hour: '23:00', activeUsers: 67, tasksCompleted: 23 },
        ],
        userRetention: [
          { period: 'Day 1', retained: 450, percentage: 100 },
          { period: 'Day 7', retained: 340, percentage: 76 },
          { period: 'Day 30', retained: 230, percentage: 51 },
          { period: 'Day 90', retained: 156, percentage: 35 },
          { period: 'Day 180', retained: 98, percentage: 22 },
        ],
        userEarnings: [
          { range: '0-1K', count: 280, percentage: 19 },
          { range: '1K-5K', count: 450, percentage: 31 },
          { range: '5K-10K', count: 380, percentage: 26 },
          { range: '10K-25K', count: 280, percentage: 19 },
          { range: '25K+', count: 67, percentage: 5 },
        ],
        referralNetwork: [
          { level: 1, count: 1250, earnings: 45000 },
          { level: 2, count: 340, earnings: 12000 },
          { level: 3, count: 89, earnings: 3500 },
          { level: 4, count: 23, earnings: 980 },
        ],
        userDemographics: [
          { ageGroup: '18-24', count: 380, percentage: 26 },
          { ageGroup: '25-34', count: 520, percentage: 36 },
          { ageGroup: '35-44', count: 340, percentage: 23 },
          { ageGroup: '45-54', count: 156, percentage: 11 },
          { ageGroup: '55+', count: 67, percentage: 4 },
        ]
      };

      setUserAnalyticsData(mockData);

    } catch (err) {
      console.error('User analytics data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAnalyticsData();
  }, [dateRange]);

  // Chart configurations
  const userGrowthConfig = {
    data: userAnalyticsData.userGrowth,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
    point: { size: 4, shape: 'circle' },
    tooltip: {
      formatter: (datum: any) => ({
        name: datum.type,
        value: datum.value?.toLocaleString(),
      }),
    },
  };

  const userSegmentsConfig = {
    data: userAnalyticsData.userSegments,
    angleField: 'count',
    colorField: 'segment',
    radius: 0.8,
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
    label: {
      type: 'outer',
      content: '{name} {percentage}',
      style: { fill: 'white', fontSize: 14, fontWeight: 'bold' }
    },
    interactions: [{ type: 'element-active' }],
  };

  const userActivityConfig = {
    data: userAnalyticsData.userActivity,
    xField: 'hour',
    yField: 'activeUsers',
    color: '#FF6B6B',
    columnWidthRatio: 0.8,
    meta: {
      activeUsers: { alias: 'Active Users' },
      hour: { alias: 'Hour of Day' },
    },
  };

  const userEarningsConfig = {
    data: userAnalyticsData.userEarnings,
    xField: 'range',
    yField: 'count',
    color: '#45B7D1',
    columnWidthRatio: 0.6,
    meta: {
      count: { alias: 'Number of Users' },
      range: { alias: 'Earnings Range' },
    },
  };

  const retentionConfig = {
    data: userAnalyticsData.userRetention.map((retention: any) => ({
      period: retention.period,
      rate: retention.percentage
    })),
    xField: 'period',
    yField: 'rate',
    color: '#FF6B6B',
    columnWidthRatio: 0.6,
    meta: {
      rate: { alias: 'Retention Rate (%)' },
      period: { alias: 'Period' },
    },
  };

  const totalUsers = userAnalyticsData.userGrowth[userAnalyticsData.userGrowth.length - 1]?.totalUsers || 0;
  const activeUsers = userAnalyticsData.userGrowth[userAnalyticsData.userGrowth.length - 1]?.activeUsers || 0;
  const newUsers = userAnalyticsData.userGrowth.reduce((sum: number, d: any) => sum + d.newUsers, 0);
  const totalRevenue = userAnalyticsData.topPerformers.reduce((sum: number, u: any) => sum + u.earnings, 0);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px', color: 'white' }}>Loading user analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', minHeight: '100vh' }}>
        <Alert
          message="Error loading user analytics"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={fetchUserAnalyticsData}>
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
          👥 Advanced User Analytics
        </Title>
        <Text style={{ color: 'white', fontSize: '18px' }}>Comprehensive insights into user behavior and engagement</Text>
        <div style={{ marginTop: '16px' }}>
          <Search
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300, marginRight: '12px' }}
          />
          <Select
            value={selectedSegment}
            onChange={setSelectedSegment}
            style={{ width: 200, marginRight: '12px' }}
          >
            <Option value="all">All Segments</Option>
            <Option value="new">New Users</Option>
            <Option value="active">Active Users</Option>
            <Option value="premium">Premium Users</Option>
            <Option value="vip">VIP Users</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange([dates[0]!, dates[1]!])}
            format="YYYY-MM-DD"
            style={{ marginRight: '12px' }}
          />
          <Button 
            type="primary" 
            icon={<RocketOutlined />} 
            onClick={fetchUserAnalyticsData}
            style={{ background: '#FF6B6B', borderColor: '#FF6B6B' }}
          >
            Refresh Analytics
          </Button>
        </div>
      </div>

      {/* Key User Metrics */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', border: 'none', borderRadius: '16px' }}>
            <Statistic
              title={<Text style={{ color: 'white', fontWeight: 'bold' }}>Total Users</Text>}
              value={totalUsers}
              prefix={<UserOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)', border: 'none', borderRadius: '16px' }}>
            <Statistic
              title={<Text style={{ color: 'white', fontWeight: 'bold' }}>Active Users</Text>}
              value={activeUsers}
              prefix={<TeamOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: 'linear-gradient(135deg, #45B7D1 0%, #2196F3 100%)', border: 'none', borderRadius: '16px' }}>
            <Statistic
              title={<Text style={{ color: 'white', fontWeight: 'bold' }}>New Users</Text>}
              value={newUsers}
              prefix={<RiseOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: 'linear-gradient(135deg, #96CEB4 0%, #88D8B0 100%)', border: 'none', borderRadius: '16px' }}>
            <Statistic
              title={<Text style={{ color: 'white', fontWeight: 'bold' }}>User Revenue</Text>}
              value={totalRevenue}
              prefix={<DollarOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              suffix="KES"
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ background: 'white', borderRadius: '16px', padding: '24px' }}>
        <TabPane tab={<span><BarChartOutlined style={{ color: '#FF6B6B' }} /> Growth Analysis</span>} key="growth">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card title={<span><RiseOutlined style={{ color: '#FF6B6B' }} /> User Growth Trends</span>} style={{ borderRadius: '16px' }}>
                <Line {...userGrowthConfig} height={400} />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title={<span><PieChartOutlined style={{ color: '#4ECDC4' }} /> User Segments</span>} style={{ borderRadius: '16px' }}>
                <Pie {...userSegmentsConfig} height={400} />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><ClockCircleOutlined style={{ color: '#45B7D1' }} /> Activity Patterns</span>} key="activity">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title={<span><ThunderboltOutlined style={{ color: '#FF6B6B' }} /> Hourly Activity</span>} style={{ borderRadius: '16px' }}>
                <Column {...userActivityConfig} height={350} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title={<span><DollarOutlined style={{ color: '#4ECDC4' }} /> User Earnings</span>} style={{ borderRadius: '16px' }}>
                <Column {...userEarningsConfig} height={350} />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><HeartOutlined style={{ color: '#96CEB4' }} /> Retention Analysis</span>} key="retention">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card title={<span><StarOutlined style={{ color: '#FF6B6B' }} /> Cohort Retention</span>} style={{ borderRadius: '16px' }}>
                <Line {...retentionConfig} height={400} />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title={<span><CrownOutlined style={{ color: '#4ECDC4' }} /> Top Performers</span>} style={{ borderRadius: '16px' }}>
                <List
                  dataSource={userAnalyticsData.topPerformers}
                  renderItem={(user: any, index: number) => (
                    <List.Item style={{ background: index % 2 === 0 ? '#F8F9FA' : 'white', borderRadius: '8px', marginBottom: '8px' }}>
                      <List.Item.Meta
                        avatar={<Avatar style={{ background: '#FF6B6B' }}>{index + 1}</Avatar>}
                        title={<Text style={{ color: '#333', fontWeight: 'bold' }}>{user.name}</Text>}
                        description={
                          <div>
                            <Text type="secondary">{user.email}</Text><br />
                            <Text style={{ color: '#4ECDC4', fontWeight: 'bold' }}>KES {user.earnings.toLocaleString()}</Text>
                            <Tag color="blue" style={{ marginLeft: '8px' }}>Level {user.level}</Tag>
                            <Tag color="green">{user.tasks} tasks</Tag>
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

        <TabPane tab={<span><MonitorOutlined style={{ color: '#FFEAA7' }} /> Behavior Analysis</span>} key="behavior">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title={<span><FireOutlined style={{ color: '#FF6B6B' }} /> User Activity</span>} style={{ borderRadius: '16px' }}>
                <List
                  dataSource={userAnalyticsData.userActivity}
                  renderItem={(activity: any, index: number) => (
                    <List.Item style={{ background: index % 2 === 0 ? '#F8F9FA' : 'white', borderRadius: '8px', marginBottom: '8px' }}>
                      <List.Item.Meta
                        avatar={<Avatar style={{ background: '#4ECDC4' }}>{activity.hour.substring(0, 2).toUpperCase()}</Avatar>}
                        title={<Text style={{ color: '#333', fontWeight: 'bold' }}>{activity.hour}</Text>}
                        description={
                          <div>
                            <Text type="secondary">{activity.activeUsers} active users</Text><br />
                            <Text style={{ color: '#45B7D1', fontWeight: 'bold' }}>{activity.tasksCompleted} tasks completed</Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title={<span><RocketOutlined style={{ color: '#96CEB4' }} /> User Demographics</span>} style={{ borderRadius: '16px' }}>
                <List
                  dataSource={userAnalyticsData.userDemographics}
                  renderItem={(demographic: any, index: number) => (
                    <List.Item style={{ background: index % 2 === 0 ? '#F8F9FA' : 'white', borderRadius: '8px', marginBottom: '8px' }}>
                      <List.Item.Meta
                        avatar={<Avatar style={{ background: '#FFEAA7', color: '#333' }}>{demographic.ageGroup.substring(0, 2).toUpperCase()}</Avatar>}
                        title={<Text style={{ color: '#333', fontWeight: 'bold' }}>{demographic.ageGroup}</Text>}
                        description={
                          <div>
                            <Text type="secondary">{demographic.count} users</Text><br />
                            <Tag color="blue" style={{ marginLeft: '8px' }}>{demographic.percentage}% of total</Tag>
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

export default UsersAnalyticsPage;
