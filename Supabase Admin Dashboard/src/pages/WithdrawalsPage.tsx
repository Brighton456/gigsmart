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
  Statistic,
  Descriptions
} from 'antd';
import { 
  SearchOutlined, 
  CheckOutlined, 
  CloseOutlined,
  EyeOutlined,
  DollarOutlined,
  BankOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  FilterOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useDashboardStore } from '../store/useDashboardStore';
import { AdminWithdrawalRequest } from '../lib/supabase';
import { format } from 'date-fns';
import PaymentReceipt from '../components/PaymentReceipt';

const { Title, Text } = Typography;
const { Search } = Input;
const { TextArea } = Input;

const WithdrawalsPage: React.FC = () => {
  const { 
    withdrawalRequests, 
    loading, 
    fetchWithdrawalRequests, 
    updateWithdrawalRequest 
  } = useDashboardStore();

  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<AdminWithdrawalRequest | null>(null);
  const [isReceiptVisible, setIsReceiptVisible] = useState(false);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
  });

  useEffect(() => {
    fetchWithdrawalRequests();
  }, [fetchWithdrawalRequests]);

  // Calculate statistics
  const totalWithdrawals = withdrawalRequests.length;
  const pendingWithdrawals = withdrawalRequests.filter(w => w.status === 'pending').length;
  const completedWithdrawals = withdrawalRequests.filter(w => w.status === 'completed').length;
  const totalAmount = withdrawalRequests
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + w.net_amount, 0);

  const handleApprove = async (withdrawal: AdminWithdrawalRequest) => {
    try {
      await updateWithdrawalRequest(withdrawal.id, {
        status: 'completed',
        processed_at: new Date().toISOString(),
        processed_by: 'Admin', // In real app, this would be the logged-in user
      });
      message.success('Withdrawal approved successfully!');
    } catch (error) {
      message.error('Failed to approve withdrawal');
    }
  };

  const handleReject = async (withdrawal: AdminWithdrawalRequest, reason: string) => {
    try {
      await updateWithdrawalRequest(withdrawal.id, {
        status: 'rejected',
        rejection_reason: reason,
        processed_at: new Date().toISOString(),
        processed_by: 'Admin',
      });
      message.success('Withdrawal rejected successfully!');
    } catch (error) {
      message.error('Failed to reject withdrawal');
    }
  };

  const handleViewDetails = (withdrawal: AdminWithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setIsModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'processing';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckOutlined />;
      case 'pending': return <ClockCircleOutlined />;
      case 'rejected': return <CloseOutlined />;
      default: return null;
    }
  };

  const filteredWithdrawals = withdrawalRequests.filter(withdrawal => {
    if (filters.status && withdrawal.status !== filters.status) return false;
    if (filters.paymentMethod && withdrawal.payment_method !== filters.paymentMethod) return false;
    if (searchText && !(
      withdrawal.user_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      withdrawal.user_email?.toLowerCase().includes(searchText.toLowerCase()) ||
      withdrawal.user_phone?.toLowerCase().includes(searchText.toLowerCase()) ||
      withdrawal.external_reference?.toLowerCase().includes(searchText.toLowerCase())
    )) return false;
    return true;
  });

  const columns = [
    {
      title: 'Request ID',
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
      render: (name: string, record: AdminWithdrawalRequest) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.user_email}
          </Text>
        </div>
      ),
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
      sorter: (a: AdminWithdrawalRequest, b: AdminWithdrawalRequest) => a.amount - b.amount,
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
      render: (amount: number) => (
        <Text style={{ fontWeight: 500, color: '#f5222d' }}>
          KES {amount.toFixed(2)}
        </Text>
      ),
      sorter: (a: AdminWithdrawalRequest, b: AdminWithdrawalRequest) => a.net_amount - b.net_amount,
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
        { text: 'Pending', value: 'pending' },
        { text: 'Completed', value: 'completed' },
        { text: 'Rejected', value: 'rejected' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value: any, record: AdminWithdrawalRequest) => record.status === value,
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
      title: 'Account Details',
      dataIndex: 'withdrawal_account_details',
      key: 'withdrawal_account_details',
      width: 150,
      ellipsis: true,
      render: (details: string) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {details}
        </Text>
      ),
    },
    {
      title: 'Requested',
      dataIndex: 'requested_at',
      key: 'requested_at',
      width: 120,
      render: (date: string) => (
        <Text type="secondary">
          {format(new Date(date), 'MMM dd, HH:mm')}
        </Text>
      ),
      sorter: (a: AdminWithdrawalRequest, b: AdminWithdrawalRequest) => 
        new Date(a.requested_at).getTime() - new Date(b.requested_at).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_: any, record: AdminWithdrawalRequest) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          
          {record.status === 'completed' && (
            <Tooltip title="Print Receipt">
              <Button
                type="text"
                icon={<FileTextOutlined />}
                onClick={() => {
                  setSelectedWithdrawal(record);
                  setIsReceiptVisible(true);
                }}
              />
            </Tooltip>
          )}
          
          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="Approve Withdrawal"
                description="Are you sure you want to approve this withdrawal?"
                onConfirm={() => handleApprove(record)}
                okText="Approve"
                cancelText="Cancel"
              >
                <Tooltip title="Approve">
                  <Button
                    type="text"
                    icon={<CheckOutlined />}
                    style={{ color: '#52c41a' }}
                  />
                </Tooltip>
              </Popconfirm>
              
              <Popconfirm
                title="Reject Withdrawal"
                description="Please provide a reason for rejection."
                okText="Reject"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Reject">
                  <Button
                    type="text"
                    icon={<CloseOutlined />}
                    style={{ color: '#f5222d' }}
                    onClick={() => {
                      const reason = prompt('Please enter rejection reason:');
                      if (reason) {
                        handleReject(record, reason);
                      }
                    }}
                  />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Withdrawal Requests</Title>
        <Text type="secondary">Manage and process user withdrawal requests</Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Requests"
              value={totalWithdrawals}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Pending"
              value={pendingWithdrawals}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Completed"
              value={completedWithdrawals}
              prefix={<CheckOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Amount"
              value={totalAmount}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#722ed1' }}
              suffix="KES"
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
                  placeholder="Search withdrawals..."
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
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="completed">Completed</Select.Option>
                  <Select.Option value="rejected">Rejected</Select.Option>
                  <Select.Option value="cancelled">Cancelled</Select.Option>
                </Select>
                <Select
                  placeholder="Payment Method"
                  allowClear
                  style={{ width: 140 }}
                  value={filters.paymentMethod || undefined}
                  onChange={(value) => setFilters(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <Select.Option value="mpesa">M-Pesa</Select.Option>
                  <Select.Option value="bank">Bank Transfer</Select.Option>
                </Select>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button 
                  icon={<FilterOutlined />}
                  onClick={() => setFilters({ status: '', paymentMethod: '' })}
                >
                  Clear Filters
                </Button>
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={() => fetchWithdrawalRequests()}
                >
                  Refresh
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredWithdrawals}
          rowKey="id"
          loading={loading.withdrawalRequests}
          pagination={{
            total: filteredWithdrawals.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} withdrawal requests`,
          }}
          scroll={{ x: 1400 }}
          size="middle"
        />
      </Card>

      {/* Withdrawal Details Modal */}
      <Modal
        title="Withdrawal Request Details"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedWithdrawal(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
          selectedWithdrawal?.status === 'pending' && (
            <Popconfirm
              key="approve"
              title="Approve Withdrawal"
              description="Are you sure you want to approve this withdrawal?"
              onConfirm={() => {
                if (selectedWithdrawal) {
                  handleApprove(selectedWithdrawal);
                  setIsModalVisible(false);
                }
              }}
              okText="Approve"
              cancelText="Cancel"
            >
              <Button type="primary" icon={<CheckOutlined />}>
                Approve
              </Button>
            </Popconfirm>
          ),
        ]}
        width={700}
      >
        {selectedWithdrawal && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Request ID" span={2}>
              <Text code>{selectedWithdrawal.id}</Text>
            </Descriptions.Item>
            
            <Descriptions.Item label="User Name">
              {selectedWithdrawal.user_name}
            </Descriptions.Item>
            <Descriptions.Item label="User Email">
              {selectedWithdrawal.user_email}
            </Descriptions.Item>
            
            <Descriptions.Item label="User Phone">
              {selectedWithdrawal.user_phone}
            </Descriptions.Item>
            <Descriptions.Item label="User Category">
              <Tag color={selectedWithdrawal.user_category === 'premium' ? 'gold' : 'default'}>
                {selectedWithdrawal.user_category}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Requested Amount">
              KES {selectedWithdrawal.amount.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Fee">
              KES {selectedWithdrawal.fee.toFixed(2)}
            </Descriptions.Item>
            
            <Descriptions.Item label="Net Amount">
              <Text strong style={{ color: '#f5222d' }}>
                KES {selectedWithdrawal.net_amount.toFixed(2)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Real Balance">
              KES {selectedWithdrawal.real_balance?.toFixed(2) || '0.00'}
            </Descriptions.Item>
            
            <Descriptions.Item label="Payment Method">
              <Tag>{selectedWithdrawal.payment_method}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Account Type">
              {selectedWithdrawal.withdrawal_account_type}
            </Descriptions.Item>
            
            <Descriptions.Item label="Account Details" span={2}>
              {selectedWithdrawal.withdrawal_account_details}
            </Descriptions.Item>
            
            <Descriptions.Item label="External Reference">
              {selectedWithdrawal.external_reference || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Badge 
                status={getStatusColor(selectedWithdrawal.status) as any}
                text={selectedWithdrawal.status.charAt(0).toUpperCase() + selectedWithdrawal.status.slice(1)}
              />
            </Descriptions.Item>
            
            <Descriptions.Item label="Requested At">
              {format(new Date(selectedWithdrawal.requested_at), 'PPP p')}
            </Descriptions.Item>
            <Descriptions.Item label="Processed At">
              {selectedWithdrawal.processed_at 
                ? format(new Date(selectedWithdrawal.processed_at), 'PPP p')
                : 'Not processed yet'
              }
            </Descriptions.Item>
            
            {selectedWithdrawal.admin_notes && (
              <Descriptions.Item label="Admin Notes" span={2}>
                {selectedWithdrawal.admin_notes}
              </Descriptions.Item>
            )}
            
            {selectedWithdrawal.rejection_reason && (
              <Descriptions.Item label="Rejection Reason" span={2}>
                <Text type="danger">{selectedWithdrawal.rejection_reason}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      <PaymentReceipt
        visible={isReceiptVisible}
        onClose={() => {
          setIsReceiptVisible(false);
          setSelectedWithdrawal(null);
        }}
        data={selectedWithdrawal || undefined}
        type="withdrawal"
      />
    </div>
  );
};

export default WithdrawalsPage;
