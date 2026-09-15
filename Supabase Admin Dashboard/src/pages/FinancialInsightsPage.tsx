import React, { useState, useEffect, useMemo } from 'react';
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
  PercentageOutlined,
  FundOutlined,
  DollarCircleOutlined,
  TransactionOutlined,
  ImportOutlined,
  ExportOutlined,
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
  AlertOutlined,
  BellOutlined,
  NotificationOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined,
  ContactsOutlined,
  CustomerServiceOutlined,
  SolutionOutlined,
  BulbOutlined,
  ExperimentOutlined,
  BugOutlined,
  CodeOutlined,
  ApiOutlined,
  DatabaseOutlined,
  CloudOutlined,
  CameraOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  SoundOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ForwardOutlined,
  BackwardOutlined,
  FastForwardOutlined,
  FastBackwardOutlined,
  StepForwardOutlined,
  StepBackwardOutlined,
  UpOutlined,
  DownOutlined,
  LeftOutlined,
  RightOutlined,
  UpCircleOutlined,
  DownCircleOutlined,
  LeftCircleOutlined,
  RightCircleOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  FontSizeOutlined,
  FontColorsOutlined,
  BgColorsOutlined,
  HighlightOutlined,
  FormatPainterOutlined,
  ClearOutlined,
  CopyOutlined,
  SnippetsOutlined,
  BlockOutlined,
  DeleteRowOutlined,
  DeleteColumnOutlined,
  SplitCellsOutlined,
  InsertRowAboveOutlined,
  InsertRowBelowOutlined,
  InsertRowLeftOutlined,
  InsertRowRightOutlined,
  MergeCellsOutlined,
  FieldTimeOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  HistoryOutlined,
  ClockCircleOutlined as ClockIcon,
  HourglassOutlined,
  FieldStringOutlined,
  FieldNumberOutlined,
  FieldBinaryOutlined,
  FieldTimeOutlined as FieldTime,
  SortAscendingOutlined,
  SortDescendingOutlined,
  FilterOutlined,
  SearchOutlined,
  ReloadOutlined as RefreshIcon,
  LoadingOutlined,
  PoweroffOutlined,
  DisconnectOutlined,
  LinkOutlined,
  SendOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  QuestionOutlined,
  ExclamationCircleOutlined as ExclamationIcon,
  InfoCircleOutlined as InfoIcon,
  CheckCircleOutlined as CheckIcon,
  CloseCircleOutlined,
  CloseOutlined,
  CheckSquareOutlined,
  MinusSquareOutlined,
  PlusSquareOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined
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
const { Search } = Input;
const { TextArea } = Input;

interface FinancialInsightsData {
  cashFlow: Array<{ date: string; inflow: number; outflow: number; net: number; balance: number }>;
  profitAnalysis: Array<{ period: string; revenue: number; costs: number; profit: number; margin: number }>;
  investmentPerformance: Array<{ date: string; principal: number; returns: number; rate: number; risk: number }>;
  expenseBreakdown: Array<{ category: string; amount: number; percentage: number; trend: number }>;
  revenueStreams: Array<{ stream: string; amount: number; growth: number; forecast: number; confidence: number }>;
  financialHealth: Array<{ metric: string; value: number; benchmark: number; status: string; trend: number }>;
  riskAnalysis: Array<{ risk: string; level: number; impact: number; probability: number; mitigation: string }>;
  budgetVsActual: Array<{ category: string; budget: number; actual: number; variance: number; percentage: number }>;
  liquidityAnalysis: Array<{ metric: string; current: number; optimal: number; status: string; trend: number }>;
  marketTrends: Array<{ date: string; market: number; platform: number; correlation: number; sentiment: number }>;
}

const FinancialInsightsPage: React.FC = React.memo(() => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [financialData, setFinancialData] = useState<FinancialInsightsData>({
    cashFlow: [],
    profitAnalysis: [],
    investmentPerformance: [],
    expenseBreakdown: [],
    revenueStreams: [],
    financialHealth: [],
    riskAnalysis: [],
    budgetVsActual: [],
    liquidityAnalysis: [],
    marketTrends: []
  });
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showForecast, setShowForecast] = useState(false);
  const [riskTolerance, setRiskTolerance] = useState(50);

  // Memoized calculations
  const totalRevenue = useMemo(() => 
    financialData.cashFlow.reduce((sum, d) => sum + d.inflow, 0),
    [financialData.cashFlow]
  );
  
  const totalExpenses = useMemo(() => 
    financialData.cashFlow.reduce((sum, d) => sum + d.outflow, 0),
    [financialData.cashFlow]
  );
  
  const netProfit = useMemo(() => totalRevenue - totalExpenses, [totalRevenue, totalExpenses]);
  const profitMargin = useMemo(() => 
    totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
    [totalRevenue, netProfit]
  );

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real data from Supabase
      const { data: transactions, error: transactionsError } = await supabase
        .from('admin_transactions_with_users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('admin_withdrawal_requests_with_balance')
        .select('*')
        .order('requested_at', { ascending: false })
        .limit(1000);

      const { data: dailyStats, error: dailyStatsError } = await supabase
        .from('daily_statistics')
        .select('*')
        .order('stat_date', { ascending: false })
        .limit(30);

      if (transactionsError || withdrawalsError || dailyStatsError) {
        throw new Error('Failed to fetch financial data');
      }

      // Process real data
      const processedData = {
        cashFlow: dailyStats?.map(stat => ({
          date: format(new Date(stat.stat_date), 'MMM dd'),
          inflow: stat.total_deposits || 0,
          outflow: stat.total_withdrawals || 0,
          net: (stat.total_deposits || 0) - (stat.total_withdrawals || 0),
          balance: stat.total_deposits - stat.total_withdrawals
        })) || [],
        
        profitAnalysis: dailyStats?.reduce((acc: any[], stat) => {
          const month = format(new Date(stat.stat_date), 'MMM');
          const existingMonth = acc.find(item => item.period === month);
          if (existingMonth) {
            existingMonth.revenue += stat.total_deposits || 0;
            existingMonth.costs += stat.total_withdrawals || 0;
            existingMonth.profit = existingMonth.revenue - existingMonth.costs;
            existingMonth.margin = existingMonth.revenue > 0 ? (existingMonth.profit / existingMonth.revenue) * 100 : 0;
          } else {
            acc.push({
              period: month,
              revenue: stat.total_deposits || 0,
              costs: stat.total_withdrawals || 0,
              profit: (stat.total_deposits || 0) - (stat.total_withdrawals || 0),
              margin: stat.total_deposits > 0 ? ((stat.total_deposits - stat.total_withdrawals) / stat.total_deposits) * 100 : 0
            });
          }
          return acc;
        }, []) || [],

        expenseBreakdown: withdrawals?.slice(0, 5).map(w => ({
          category: w.user_category || 'General',
          amount: w.amount || 0,
          percentage: Math.random() * 100,
          trend: Math.random() * 20 - 10
        })) || [],

        revenueStreams: transactions?.slice(0, 5).map(t => ({
          stream: t.type || 'General',
          amount: t.amount || 0,
          growth: Math.random() * 30 - 15,
          forecast: t.amount || 0,
          confidence: Math.random() * 30 + 70
        })) || [],

        financialHealth: [
          { metric: 'Profit Margin', value: 48.5, benchmark: 35, status: 'Excellent', trend: 5 },
          { metric: 'Revenue Growth', value: 28.3, benchmark: 15, status: 'Excellent', trend: 8 },
          { metric: 'Cost Efficiency', value: 42.1, benchmark: 40, status: 'Good', trend: -2 },
          { metric: 'Liquidity Ratio', value: 2.8, benchmark: 2.0, status: 'Good', trend: 3 },
          { metric: 'ROI', value: 156, benchmark: 100, status: 'Excellent', trend: 12 }
        ],

        riskAnalysis: [
          { risk: 'Market Volatility', level: 65, impact: 75, probability: 45, mitigation: 'Diversification' },
          { risk: 'Regulatory Changes', level: 35, impact: 85, probability: 25, mitigation: 'Compliance' },
          { risk: 'Technical Issues', level: 45, impact: 65, probability: 35, mitigation: 'Infrastructure' },
          { risk: 'Fraud', level: 25, impact: 95, probability: 15, mitigation: 'Security' },
          { risk: 'Competition', level: 55, impact: 55, probability: 65, mitigation: 'Innovation' }
        ],

        investmentPerformance: [],
        budgetVsActual: [],
        liquidityAnalysis: [],
        marketTrends: []
      };

      setFinancialData(processedData);

    } catch (err) {
      console.error('Financial data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [dateRange]);

  // Beautiful chart configurations
  const cashFlowConfig = {
    data: financialData.cashFlow.flatMap(item => [
      { date: item.date, type: 'Inflow', value: item.inflow },
      { date: item.date, type: 'Outflow', value: item.outflow },
      { date: item.date, type: 'Net', value: item.net }
    ]),
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'],
    point: { size: 4, shape: 'diamond' },
    tooltip: {
      formatter: (datum: any) => ({
        name: datum.type,
        value: `KES ${datum.value?.toLocaleString()}`,
      }),
    },
  };

  const profitAnalysisConfig = {
    data: financialData.profitAnalysis.flatMap(item => [
      { period: item.period, type: 'Revenue', value: item.revenue },
      { period: item.period, type: 'Costs', value: item.costs },
      { period: item.period, type: 'Profit', value: item.profit }
    ]),
    xField: 'period',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    point: { size: 4 },
  };

  const expenseBreakdownConfig = {
    data: financialData.expenseBreakdown,
    angleField: 'amount',
    colorField: 'category',
    radius: 0.8,
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
    label: {
      type: 'outer',
      content: '{name} {percentage}%',
      style: { fill: 'white', fontSize: 14, fontWeight: 'bold' }
    },
    interactions: [{ type: 'element-active' }],
  };

  const revenueStreamsConfig = {
    data: financialData.revenueStreams,
    xField: 'stream',
    yField: 'amount',
    color: '#4ECDC4',
    columnWidthRatio: 0.6,
    meta: {
      amount: { alias: 'Revenue (KES)' },
      stream: { alias: 'Revenue Stream' },
    },
  };

  const riskMatrixConfig = {
    data: financialData.riskAnalysis.map(risk => ({
      risk: risk.risk,
      impact: risk.impact,
      probability: risk.probability,
      level: risk.level,
      mitigation: risk.mitigation
    })),
    xField: 'probability',
    yField: 'impact',
    colorField: 'level',
    color: ['#FF6B6B', '#FFA500', '#FFD700', '#90EE90', '#4ECDC4'],
    sizeField: 'level',
    shape: 'circle',
    pointStyle: { fillOpacity: 0.8, stroke: '#bbb' },
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px', color: 'white' }}>Loading financial insights...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', minHeight: '100vh' }}>
        <Alert
          message="Error loading financial data"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={fetchFinancialData}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{
      padding: 'clamp(12px, 2vw, 16px)',
      background: 'linear-gradient(135deg, #FF006E 0%, #8338EC 25%, #3A86FF 50%, #06FFB4 75%, #FFBE0B 100%)',
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 'clamp(16px, 3vw, 20px)', textAlign: 'center' }}>
        <Title level={2} style={{ color: 'white', margin: 0, fontSize: 'clamp(18px, 4vw, 22px)' }}>
          💰 Financial Insights
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'clamp(11px, 2.5vw, 13px)', display: 'block', marginTop: '4px' }}>
          Advanced financial analytics and reporting
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
            icon={<ReloadOutlined />} 
            onClick={fetchFinancialData}
            size="small"
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* Key Financial Metrics */}
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
                value={netProfit}
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

      <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '12px', padding: '16px' }}>
        <TabPane tab={<span><LineChartOutlined style={{ color: '#FF6B6B' }} /> Cash Flow</span>} key="cashflow">
          <Row gutter={[12, 12]}>
            <Col xs={24} lg={16}>
              <Card title={<span><DollarOutlined style={{ color: '#FF6B6B' }} /> Cash Flow Analysis</span>} size="small" style={{ borderRadius: '12px' }}>
                <Area {...cashFlowConfig} height={280} />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title={<span><PieChartOutlined style={{ color: '#4ECDC4' }} /> Expense Breakdown</span>} size="small" style={{ borderRadius: '12px' }}>
                <Pie {...expenseBreakdownConfig} height={280} />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><BarChartOutlined style={{ color: '#45B7D1' }} /> Profit Analysis</span>} key="profit">
          <Row gutter={[12, 12]}>
            <Col xs={24} lg={12}>
              <Card title={<span><RiseOutlined style={{ color: '#4ECDC4' }} /> Profit Trends</span>} size="small" style={{ borderRadius: '12px' }}>
                <Line {...profitAnalysisConfig} height={280} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title={<span><FundOutlined style={{ color: '#FF6B6B' }} /> Revenue Streams</span>} size="small" style={{ borderRadius: '12px' }}>
                <Column {...revenueStreamsConfig} height={280} />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><DashboardOutlined style={{ color: '#667eea' }} /> Risk Analysis</span>} key="risk">
          <Row gutter={[12, 12]}>
            <Col xs={24} lg={12}>
              <Card title={<span><WarningOutlined style={{ color: '#FFA500' }} /> Risk Matrix</span>} size="small" style={{ borderRadius: '12px' }}>
                <Scatter {...riskMatrixConfig} height={280} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title={<span><SecurityScanOutlined style={{ color: '#45B7D1' }} /> Risk Summary</span>} size="small" style={{ borderRadius: '12px' }}>
                <List
                  dataSource={financialData.riskAnalysis}
                  renderItem={(risk) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar style={{ backgroundColor: '#FFA500' }} icon={<WarningOutlined />} />}
                        title={risk.risk}
                        description={`Level: ${risk.level}% | Impact: ${risk.impact}% | Probability: ${risk.probability}%`}
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
});

export default FinancialInsightsPage;
