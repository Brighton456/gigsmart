import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Card, 
  Typography, 
  Space, 
  Input, 
  Button, 
  Tag, 
  Avatar,
  Modal,
  Form,
  Select,
  InputNumber,
  message,
  Tooltip,
  Popconfirm,
  Badge,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  SearchOutlined, 
  EditOutlined, 
  EyeOutlined,
  DollarOutlined,
  ReloadOutlined,
  FilterOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { useDashboardStore } from '../store/useDashboardStore';
import { AdminTransaction } from '../lib/supabase';
import { format } from 'date-fns';
import { DatePicker } from 'antd';
import PaymentReceipt from '../components/PaymentReceipt';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

const TransactionsPage: React.FC = () => {
  const { 
    transactions, 
    loading, 
    error, 
    fetchTransactions, 
    updateTransaction 
  } = useDashboardStore();

  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<AdminTransaction | null>(null);
  const [isReceiptVisible, setIsReceiptVisible] = useState(false);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    paymentMethod: '',
    dateRange: null as any,
  });

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Calculate statistics
  const totalTransactions = transactions.length;
  const totalRevenue = transactions
    .filter(t => t.type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.net_amount, 0);
  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + t.net_amount, 0);
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;

  const handleEdit = (transaction: AdminTransaction) => {
    setSelectedTransaction(transaction);
    form.setFieldsValue({
      type: transaction.type,
      amount: transaction.amount,
      fee: transaction.fee,
      status: transaction.status,
      payment_method: transaction.payment_method,
      admin_notes: transaction.admin_notes,
    });
    setIsModalVisible(true);
  };

  const handleUpdate = async (values: any) => {
    if (!selectedTransaction) return;

    try {
      await updateTransaction(selectedTransaction.id, values);
      message.success('Transaction updated successfully!');
      setIsModalVisible(false);
      setSelectedTransaction(null);
      form.resetFields();
    } catch (error) {
      message.error('Failed to update transaction');
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions.map(t => ({
      ID: t.id,
      User: t.user_name,
      Email: t.user_email,
      Phone: t.user_phone,
      Type: t.type,
      Amount: t.amount,
      Fee: t.fee,
      'Net Amount': t.net_amount,
      Status: t.status,
      'Payment Method': t.payment_method,
      Description: t.description,
      Created: format(new Date(t.created_at), 'yyyy-MM-dd HH:mm:ss'),
      Processed: t.processed_at ? format(new Date(t.processed_at), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, `transactions_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'processing';
      case 'failed': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleOutlined />;
      case 'pending': return <ClockCircleOutlined />;
      case 'failed': return <CloseCircleOutlined />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'green';
      case 'withdrawal': return 'red';
      case 'bonus': return 'blue';
      case 'refund': return 'orange';
      default: return 'default';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filters.status && transaction.status !== filters.status) return false;
    if (filters.type && transaction.type !== filters.type) return false;
    if (filters.paymentMethod && transaction.payment_method !== filters.paymentMethod) return false;
    if (searchText && !(
      transaction.user_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.user_email?.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.user_phone?.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchText.toLowerCase())
    )) return false;
    return true;
  });

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => (
        <Text code style={{ fontSize: '12px' }}>
          {id.substring(0, 8)}...
        </Text>
      ),
    },
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user',
      width: 180,
      render: (name: string, record: AdminTransaction) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.user_email}
          </Text>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>
          {type.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Deposit', value: 'deposit' },
        { text: 'Withdrawal', value: 'withdrawal' },
        { text: 'Bonus', value: 'bonus' },
        { text: 'Refund', value: 'refund' },
      ],
      onFilter: (value: any, record: AdminTransaction) => record.type === value,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => (
        <Text style={{ fontWeight: 500 }}>
          KES {amount.toFixed(2)}
        </Text>
      ),
      sorter: (a: AdminTransaction, b: AdminTransaction) => a.amount - b.amount,
    },
    {
      title: 'Fee',
      dataIndex: 'fee',
      key: 'fee',
      width: 100,
      render: (fee: number) => (
        <Text type="secondary">
          KES {fee.toFixed(2)}
        </Text>
      ),
    },
    {
      title: 'Net Amount',
      dataIndex: 'net_amount',
      key: 'net_amount',
      width: 120,
      render: (amount: number, record: AdminTransaction) => (
        <Text 
          style={{ 
            fontWeight: 500,
            color: record.type === 'deposit' ? '#52c41a' : '#f5222d'
          }}
        >
          KES {amount.toFixed(2)}
        </Text>
      ),
      sorter: (a: AdminTransaction, b: AdminTransaction) => a.net_amount - b.net_amount,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Badge 
          status={getStatusColor(status) as any}
          text={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      ),
      filters: [
        { text: 'Completed', value: 'completed' },
        { text: 'Pending', value: 'pending' },
        { text: 'Failed', value: 'failed' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value: any, record: AdminTransaction) => record.status === value,
    },
    {
      title: 'Payment Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 120,
      render: (method: string) => (
        <Tag>{method}</Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => (
        <Text type="secondary">
          {format(new Date(date), 'MMM dd, HH:mm')}
        </Text>
      ),
      sorter: (a: AdminTransaction, b: AdminTransaction) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: AdminTransaction) => (
        <Space>
          <Tooltip title="Edit Transaction">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                message.info('Transaction details view coming soon!');
              }}
            />
          </Tooltip>
          <Tooltip title="Print Receipt">
            <Button
              type="text"
              icon={<FileTextOutlined />}
              onClick={() => {
                setSelectedTransaction(record);
                setIsReceiptVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Transactions</Title>
        <Text type="secondary">Manage all platform transactions and payments</Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Transactions"
              value={totalTransactions}
              prefix={<DollarOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={totalRevenue}
              prefix={<DollarOutlined />}
              precision={2}
              styles={{ content: { color: '#52c41a' } }}
              suffix="KES"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Pending Transactions"
              value={pendingTransactions}
              prefix={<ClockCircleOutlined />}
              styles={{ content: { color: '#fa8c16' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* Filters */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col flex="auto">
              <Space wrap>
                <Search
                  placeholder="Search transactions..."
                  allowClear
                  enterButton
                  style={{ width: 250 }}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Select
                  placeholder="Status"
                  allowClear
                  style={{ width: 120 }}
                  value={filters.status || undefined}
                  onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <Select.Option value="completed">Completed</Select.Option>
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="failed">Failed</Select.Option>
                  <Select.Option value="cancelled">Cancelled</Select.Option>
                </Select>
                <Select
                  placeholder="Type"
                  allowClear
                  style={{ width: 120 }}
                  value={filters.type || undefined}
                  onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                >
                  <Select.Option value="deposit">Deposit</Select.Option>
                  <Select.Option value="withdrawal">Withdrawal</Select.Option>
                  <Select.Option value="bonus">Bonus</Select.Option>
                  <Select.Option value="refund">Refund</Select.Option>
                </Select>
                <RangePicker
                  style={{ width: 240 }}
                  onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
                />
              </Space>
            </Col>
            <Col>
              <Space>
                <Button 
                  icon={<FilterOutlined />}
                  onClick={() => setFilters({ status: '', type: '', paymentMethod: '', dateRange: null })}
                >
                  Clear Filters
                </Button>
                <Button 
                  icon={<ExportOutlined />}
                  onClick={exportToExcel}
                >
                  Export
                </Button>
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={() => fetchTransactions()}
                >
                  Refresh
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="id"
          loading={loading.transactions}
          pagination={{
            total: filteredTransactions.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} transactions`,
          }}
          scroll={{ x: 1400 }}
          size="middle"
        />
      </Card>

      {/* Edit Transaction Modal */}
      <Modal
        title="Edit Transaction"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedTransaction(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            label="Transaction Type"
            name="type"
            rules={[{ required: true, message: 'Please select transaction type!' }]}
          >
            <Select>
              <Select.Option value="deposit">Deposit</Select.Option>
              <Select.Option value="withdrawal">Withdrawal</Select.Option>
              <Select.Option value="bonus">Bonus</Select.Option>
              <Select.Option value="refund">Refund</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Amount"
            name="amount"
            rules={[{ required: true, message: 'Please input amount!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `KES ${value}`}
              parser={(value: string | undefined) => parseFloat(value?.replace(/KES\s?|(,*)/g, '') || '0')}
              min={0}
              step={0.01}
            />
          </Form.Item>

          <Form.Item
            label="Fee"
            name="fee"
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `KES ${value}`}
              parser={(value: string | undefined) => parseFloat(value?.replace(/KES\s?|(,*)/g, '') || '0')}
              min={0}
              step={0.01}
            />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="failed">Failed</Select.Option>
              <Select.Option value="cancelled">Cancelled</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Payment Method"
            name="payment_method"
          >
            <Select>
              <Select.Option value="mpesa">M-Pesa</Select.Option>
              <Select.Option value="bank">Bank Transfer</Select.Option>
              <Select.Option value="card">Credit Card</Select.Option>
              <Select.Option value="paypal">PayPal</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Admin Notes"
            name="admin_notes"
          >
            <Input.TextArea rows={3} placeholder="Add any notes about this transaction..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update Transaction
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                setSelectedTransaction(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <PaymentReceipt
        visible={isReceiptVisible}
        onClose={() => {
          setIsReceiptVisible(false);
          setSelectedTransaction(null);
        }}
        data={selectedTransaction || undefined}
        type="transaction"
      />
    </div>
  );
};

export default TransactionsPage;
