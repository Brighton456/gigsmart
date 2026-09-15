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
  Drawer
} from 'antd';
import {
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  BankOutlined,
  TrophyOutlined,
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
  MoneyCollectOutlined,
  WalletOutlined,
  CreditCardOutlined,
  PayCircleOutlined,
  AccountBookOutlined,
  CalculatorOutlined,
  StockOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  DashboardOutlined,
  PercentageOutlined
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

interface RevenueData {
  dailyRevenue: Array<{ date: string; income: number; expenses: number; profit: number; deposits: number; withdrawals: number }>;
  incomeSources: Array<{ source: string; amount: number; percentage: number; trend: number }>;
  monthlyComparison: Array<{ month: string; current: number; previous: number; growth: number }>;
  revenueByMethod: Array<{ method: string; amount: number; count: number; avgAmount: number }>;
  profitMargins: Array<{ period: string; revenue: number; costs: number; margin: number }>;
  forecastData: Array<{ date: string; actual: number; predicted: number; confidence: number }>;
  topRevenueDays: Array<{ date: string; revenue: number; transactions: number; users: number }>;
  revenueByLevel: Array<{ level: string; users: number; revenue: number; avgPerUser: number }>;
}

const RevenuePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData>({
    dailyRevenue: [],
    incomeSources: [],
    monthlyComparison: [],
    revenueByMethod: [],
    profitMargins: [],
    forecastData: [],
    topRevenueDays: [],
    revenueByLevel: []
  });
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showForecast, setShowForecast] = useState(false);
  const [profitThreshold, setProfitThreshold] = useState(10000);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for development
      const mockData = {
        dailyRevenue: Array.from({ length: 30 }, (_, i) => ({
          date: dayjs().subtract(29 - i, 'days').format('MMM dd'),
          income: Math.floor(Math.random() * 50000) + 10000,
          expenses: Math.floor(Math.random() * 30000) + 5000,
          profit: 0,
          deposits: Math.floor(Math.random() * 50000) + 10000,
          withdrawals: Math.floor(Math.random() * 30000) + 5000
        })).map(d => ({
          ...d,
          profit: d.income - d.expenses
        })),
        incomeSources: [
          { source: 'User Deposits', amount: 450000, percentage: 75, trend: 15 },
          { source: 'Withdrawal Fees', amount: 90000, percentage: 15, trend: 8 },
          { source: 'Transaction Fees', amount: 60000, percentage: 10, trend: 12 }
        ],
        monthlyComparison: [
          { month: 'Jan', current: 125000, previous: 98000, growth: 27.6 },
          { month: 'Feb', current: 145000, previous: 112000, growth: 29.5 },
          { month: 'Mar', current: 167000, previous: 134000, growth: 24.6 },
          { month: 'Apr', current: 189000, previous: 156000, growth: 21.2 },
          { month: 'May', current: 198000, previous: 178000, growth: 11.2 },
          { month: 'Jun', current: 234000, previous: 198000, growth: 18.2 }
        ],
        revenueByMethod: [
          { method: 'M-Pesa', amount: 450000, count: 1250, avgAmount: 360 },
          { method: 'Bank Transfer', amount: 280000, count: 450, avgAmount: 622 },
          { method: 'PayPal', amount: 120000, count: 180, avgAmount: 667 },
          { method: 'Crypto', amount: 85000, count: 95, avgAmount: 895 },
          { method: 'Gift Codes', amount: 45000, count: 320, avgAmount: 141 }
        ],
        profitMargins: [
          { period: 'Q1', revenue: 437000, costs: 234000, margin: 46.5 },
          { period: 'Q2', revenue: 621000, costs: 312000, margin: 49.8 },
          { period: 'Q3', revenue: 589000, costs: 298000, margin: 49.4 },
          { period: 'Q4', revenue: 745000, costs: 356000, margin: 52.2 }
        ],
        forecastData: Array.from({ length: 30 }, (_, i) => ({
          date: dayjs().subtract(29 - i, 'days').format('MMM dd'),
          actual: Math.floor(Math.random() * 50000) + 10000,
          predicted: Math.floor(Math.random() * 50000) + 10000,
          confidence: 85 + Math.random() * 10
        })),
        topRevenueDays: Array.from({ length: 10 }, (_, i) => ({
          date: dayjs().subtract(i, 'days').format('MMM dd'),
          revenue: Math.floor(Math.random() * 50000) + 10000,
          transactions: Math.floor(Math.random() * 100) + 50,
          users: Math.floor(Math.random() * 50) + 20
        })),
        revenueByLevel: [
          { level: 'Level 1', users: 156, revenue: 45000, avgPerUser: 288 },
          { level: 'Level 2', users: 89, revenue: 38000, avgPerUser: 427 },
          { level: 'Level 3', users: 67, revenue: 42000, avgPerUser: 627 },
          { level: 'Level 4', users: 45, revenue: 51000, avgPerUser: 1133 },
          { level: 'Level 5', users: 23, revenue: 38000, avgPerUser: 1652 }
        ]
      };

      setRevenueData(mockData);

    } catch (err) {
      console.error('Revenue data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [dateRange]);

  const totalRevenue = revenueData.dailyRevenue.reduce((sum, d) => sum + d.income, 0);
  const totalExpenses = revenueData.dailyRevenue.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Beautiful chart configurations
  const revenueTrendConfig = {
    data: revenueData.dailyRevenue,
    xField: 'date',
    yField: ['income', 'expenses'],
    seriesField: 'type',
    smooth: true,
    color: ['#4ECDC4', '#FF6B6B'], // Green for income, red for expenses
    point: { size: 3, shape: 'circle' },
    tooltip: {
      formatter: (datum: any) => ({
        name: datum.type,
        value: `KES ${datum.value?.toLocaleString()}`,
      }),
    },
  };

  const incomeSourcesConfig = {
    data: revenueData.incomeSources,
    angleField: 'amount',
    colorField: 'source',
    radius: 0.8,
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
    label: {
      type: 'outer',
      content: '{name} {percentage}',
      style: { fill: 'white', fontSize: 10, fontWeight: 'bold' }
    },
    interactions: [{ type: 'element-active' }],
  };

  const monthlyComparisonConfig = {
    data: revenueData.monthlyComparison.flatMap(item => [
      { month: item.month, type: 'Current Year', value: item.current },
      { month: item.month, type: 'Previous Year', value: item.previous }
    ]),
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    color: ['#FF6B6B', '#4ECDC4'],
    columnWidthRatio: 0.8,
    meta: {
      value: { alias: 'Revenue (KES)' },
      month: { alias: 'Month' },
    },
  };

  const profitMarginConfig = {
    data: revenueData.profitMargins,
    xField: 'period',
    yField: 'margin',
    color: '#45B7D1',
    columnWidthRatio: 0.6,
    meta: {
      margin: { alias: 'Profit Margin (%)' },
      period: { alias: 'Period' },
    },
  };

  const forecastConfig = {
    data: revenueData.forecastData,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: ['#FF6B6B', '#4ECDC4'],
    point: { size: 4 },
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)', minHeight: '100vh' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px', color: 'white' }}>Loading revenue analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', minHeight: '100vh' }}>
        <Alert
          message="Error loading revenue data"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={fetchRevenueData}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '16px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
        {/* Compact Header */}
      <div style={{ 
        marginBottom: '16px', 
        textAlign: 'center'
      }}>
        <Title level={2} style={{ color: 'white', margin: 0, fontSize: '24px' }}>
          💰 Revenue Analytics
        </Title>
        <Text style={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontSize: '14px', 
          display: 'block',
          marginTop: '8px'
        }}>
          Track deposits, withdrawals and company revenue
        </Text>
      </div>

      {/* Compact Controls */}
      <div style={{ marginBottom: '20px' }}>
        <Space size="small" wrap>
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange([dates[0]!, dates[1]!])}
            format="YYYY-MM-DD"
            size="small"
          />
          <Switch
            checked={showForecast}
            onChange={setShowForecast}
            checkedChildren="Forecast"
            unCheckedChildren="Actual"
            size="small"
          />
          <Button 
            type="primary" 
            icon={<RiseOutlined />} 
            onClick={fetchRevenueData}
            size="small"
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* Compact Revenue Metrics Grid */}
      <Row gutter={[12, 12]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '12px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            hoverable
            size="small"
          >
            <div style={{ padding: '12px' }}>
              <Statistic
                title={<Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: '13px' }}>💰 Total Revenue</Text>}
                value={totalRevenue}
                prefix={<DollarOutlined style={{ color: '#FFFFFF', fontSize: '18px' }} />}
                styles={{ content: { color: '#FFFFFF', fontSize: '22px', fontWeight: '700' } }}
                suffix="KES"
              />
              <div style={{ marginTop: '12px' }}>
                <Progress 
                  percent={85} 
                  strokeColor="rgba(255,255,255,0.9)"
                  trailColor="rgba(255,255,255,0.3)"
                  strokeWidth={8}
                  size="small"
                />
                <div style={{ marginTop: '10px' }}>
                  <Space size="small">
                    <Tag style={{ 
                      background: 'rgba(255,255,255,0.3)', 
                      color: 'white', 
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '11px'
                    }}>
                      📈 +28.5%
                    </Tag>
                  </Space>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)', 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '12px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            hoverable
            size="small"
          >
            <div style={{ padding: '12px' }}>
              <Statistic
                title={<Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: '13px' }}>📈 Net Profit</Text>}
                value={totalProfit}
                prefix={<RiseOutlined style={{ color: '#FFFFFF', fontSize: '18px' }} />}
                styles={{ content: { color: '#FFFFFF', fontSize: '22px', fontWeight: '700' } }}
                suffix="KES"
              />
              <div style={{ marginTop: '12px' }}>
                <Progress 
                  percent={72} 
                  strokeColor="rgba(255,255,255,0.9)"
                  trailColor="rgba(255,255,255,0.3)"
                  strokeWidth={8}
                  size="small"
                />
                <div style={{ marginTop: '10px' }}>
                  <Space size="small">
                    <Tag style={{ 
                      background: 'rgba(255,255,255,0.3)', 
                      color: 'white', 
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '11px'
                    }}>
                      🚀 +35.2%
                    </Tag>
                  </Space>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #FF6B6B 0%, #C44569 100%)', 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '12px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            hoverable
            size="small"
          >
            <div style={{ padding: '12px' }}>
              <Statistic
                title={<Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: '13px' }}>💳 Total Expenses</Text>}
                value={totalExpenses}
                prefix={<BankOutlined style={{ color: '#FFFFFF', fontSize: '18px' }} />}
                styles={{ content: { color: '#FFFFFF', fontSize: '22px', fontWeight: '700' } }}
                suffix="KES"
              />
              <div style={{ marginTop: '12px' }}>
                <Progress 
                  percent={45} 
                  strokeColor="rgba(255,255,255,0.9)"
                  trailColor="rgba(255,255,255,0.3)"
                  strokeWidth={8}
                  size="small"
                />
                <div style={{ marginTop: '10px' }}>
                  <Space size="small">
                    <Tag style={{ 
                      background: 'rgba(255,255,255,0.3)', 
                      color: 'white', 
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '11px'
                    }}>
                      📉 -12.3%
                    </Tag>
                  </Space>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #45B7D1 0%, #2196F3 100%)', 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '12px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            hoverable
            size="small"
          >
            <div style={{ padding: '12px' }}>
              <Statistic
                title={<Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: '13px' }}>🎯 Profit Margin</Text>}
                value={profitMargin}
                prefix={<PercentageOutlined style={{ color: '#FFFFFF', fontSize: '18px' }} />}
                styles={{ content: { color: '#FFFFFF', fontSize: '22px', fontWeight: '700' } }}
                suffix="%"
                precision={1}
              />
              <div style={{ marginTop: '12px' }}>
                <Progress 
                  percent={profitMargin} 
                  strokeColor="rgba(255,255,255,0.9)"
                  trailColor="rgba(255,255,255,0.3)"
                  strokeWidth={8}
                  size="small"
                />
                <div style={{ marginTop: '10px' }}>
                  <Space size="small">
                    <Tag style={{ 
                      background: 'rgba(255,255,255,0.3)', 
                      color: 'white', 
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '11px'
                    }}>
                      ✅ Healthy
                    </Tag>
                  </Space>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[12, 12]} style={{ marginBottom: '20px' }}>
        <Col xs={24} lg={12}>
          <Card title={<span><LineChartOutlined style={{ color: '#4ECDC4' }} /> Revenue Trend</span>} size="small" style={{ borderRadius: '12px' }}>
            <Line {...revenueTrendConfig} height={280} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<span><PieChartOutlined style={{ color: '#FF6B6B' }} /> Income Sources</span>} size="small" style={{ borderRadius: '12px' }}>
            <Pie {...incomeSourcesConfig} height={280} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} lg={12}>
          <Card title={<span><BarChartOutlined style={{ color: '#45B7D1' }} /> Monthly Comparison</span>} size="small" style={{ borderRadius: '12px' }}>
            <Column {...monthlyComparisonConfig} height={280} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<span><DashboardOutlined style={{ color: '#667eea' }} /> Profit Margins</span>} size="small" style={{ borderRadius: '12px' }}>
            <Column {...profitMarginConfig} height={280} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RevenuePage;
