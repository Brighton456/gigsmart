import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  Badge
} from 'antd';
import { 
  SearchOutlined, 
  EditOutlined, 
  EyeOutlined,
  UserOutlined,
  DollarOutlined,
  TrophyOutlined,
  TeamOutlined,
  BankOutlined
} from '@ant-design/icons';
import { useDashboardStore } from '../store/useDashboardStore';
import { AdminUserSummary } from '../lib/supabase';
import { format } from 'date-fns';

const { Title, Text } = Typography;
const { Search } = Input;

const UsersPage: React.FC = React.memo(() => {
  const { 
    users, 
    loading, 
    errors, 
    fetchUsers, 
    updateUser 
  } = useDashboardStore();

  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserSummary | null>(null);
  const [form] = Form.useForm();

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [users, searchText]);

  useEffect(() => {
    fetchUsers(1, 100); // Fetch first 100 users
  }, []);

  const handleEdit = (user: AdminUserSummary) => {
    setSelectedUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      current_level: user.current_level,
      user_category: user.user_category,
      is_active: user.is_active,
      main_wallet: user.main_wallet,
      income_wallet: user.income_wallet,
      wealth_fund_balance: user.wealth_fund_balance
    });
    setIsModalVisible(true);
  };

  const handleUpdate = async (values: any) => {
    if (!selectedUser) return;
    
    try {
      await updateUser(selectedUser.id, values);
      message.success('User updated successfully!');
      setIsModalVisible(false);
      setSelectedUser(null);
      form.resetFields();
    } catch (error) {
      message.error('Failed to update user');
    }
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      width: 200,
      render: (_: any, record: AdminUserSummary) => (
        <Space>
          <Avatar 
            icon={<UserOutlined />} 
            style={{ backgroundColor: '#667eea' }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      render: (phone: string) => phone || <Text type="secondary">N/A</Text>,
    },
    {
      title: 'Level',
      dataIndex: 'current_level',
      key: 'current_level',
      width: 80,
      render: (level: number) => (
        <Tag color="blue">Level {level}</Tag>
      ),
      sorter: (a: AdminUserSummary, b: AdminUserSummary) => a.current_level - b.current_level,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive: boolean) => (
        <Badge 
          status={isActive ? 'success' : 'error'} 
          text={isActive ? 'Active' : 'Inactive'} 
        />
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value: any, record: AdminUserSummary) => record.is_active === value,
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      width: 120,
      render: (amount: number) => {
        if (amount === null || amount === undefined) return <Text type="secondary">N/A</Text>;
        return (
          <Text style={{ color: '#52c41a', fontWeight: 500 }}>
            KES {amount.toFixed(2)}
          </Text>
        );
      },
      sorter: (a: AdminUserSummary, b: AdminUserSummary) => a.real_balance - b.real_balance,
    },
    {
      title: 'Total Earnings',
      dataIndex: 'total_earnings',
      key: 'total_earnings',
      width: 130,
      render: (amount: number) => {
        if (amount === null || amount === undefined) return <Text type="secondary">N/A</Text>;
        return (
          <Text style={{ color: '#722ed1', fontWeight: 500 }}>
            KES {amount.toFixed(2)}
          </Text>
        );
      },
      sorter: (a: AdminUserSummary, b: AdminUserSummary) => a.total_earnings - b.total_earnings,
    },
    {
      title: 'Joined Date',
      dataIndex: 'joined_date',
      key: 'joined_date',
      width: 120,
      render: (date: string) => {
        try {
          return format(new Date(date), 'MMM dd, yyyy');
        } catch (error) {
          return <Text type="secondary">Invalid Date</Text>;
        }
      },
      sorter: (a: AdminUserSummary, b: AdminUserSummary) => {
        try {
          return new Date(a.created_at || a.joined_date || Date.now()).getTime() - new Date(b.created_at || b.joined_date || Date.now()).getTime();
        } catch (error) {
          return 0;
        }
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: AdminUserSummary) => (
        <Space>
          <Tooltip title="Edit User">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                message.info('User details view coming soon!');
              }}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <Title level={2} style={{ color: 'white', margin: 0, fontSize: '24px' }}>
          👥 Users Management
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', display: 'block', marginTop: '8px' }}>
          Manage platform users and their accounts
        </Text>
      </div>

      <Card 
        size="small" 
        style={{ 
          borderRadius: '12px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          background: 'rgba(255,255,255,0.95)'
        }}
      >
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <Search
            placeholder="Search users..."
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 'clamp(200px, 40vw, 280px)', maxWidth: '100%' }}
            size="small"
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button 
            type="primary" 
            icon={<UserOutlined />}
            onClick={() => {
              message.info('Add user functionality coming soon!');
            }}
            size="small"
          >
            Add User
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading.users}
          pagination={{ 
            pageSize: 8,
            size: 'small',
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
            simple: true
          }}
          scroll={{ x: 800, y: 400 }}
          size="small"
          style={{ fontSize: 'clamp(11px, 2.5vw, 13px)' }}
        />
      </Card>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedUser(null);
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
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input user name!' }]}
          >
            <Input size="small" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input size="small" />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: 'Please input phone number!' }]}
          >
            <Input size="small" />
          </Form.Item>

          <Form.Item
            label="Level"
            name="current_level"
            rules={[{ required: true, message: 'Please select level!' }]}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} size="small" />
          </Form.Item>

          <Form.Item
            label="Category"
            name="user_category"
            rules={[{ required: true, message: 'Please select category!' }]}
          >
            <Select size="small">
              <Select.Option value="standard">Standard</Select.Option>
              <Select.Option value="premium">Premium</Select.Option>
              <Select.Option value="vip">VIP</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Status"
            name="is_active"
            valuePropName="checked"
          >
            <Select size="small">
              <Select.Option value={true}>Active</Select.Option>
              <Select.Option value={false}>Inactive</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Main Wallet Balance"
            name="main_wallet"
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value: any) => `KES ${value}`}
              parser={(value: string | undefined) => parseFloat(value?.replace(/KES\s?|(,*)/g, '') || '0')}
              min={0}
              step={0.01}
              size="small"
            />
          </Form.Item>

          <Form.Item
            label="Income Wallet Balance"
            name="income_wallet"
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value: any) => `KES ${value}`}
              parser={(value: string | undefined) => parseFloat(value?.replace(/KES\s?|(,*)/g, '') || '0')}
              min={0}
              step={0.01}
              size="small"
            />
          </Form.Item>

          <Form.Item
            label="Wealth Fund Balance"
            name="wealth_fund_balance"
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value: any) => `KES ${value}`}
              parser={(value: string | undefined) => parseFloat(value?.replace(/KES\s?|(,*)/g, '') || '0')}
              min={0}
              step={0.01}
              size="small"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="small">
                Update User
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                setSelectedUser(null);
                form.resetFields();
              }} size="small">
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});

export default UsersPage;
