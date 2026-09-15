import React, { useEffect, useState, useMemo } from 'react';
import { Card, Typography, Table, Tag, Space, Button, Input, Avatar, Badge, Tooltip } from 'antd';
import { TrophyOutlined, ReloadOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useDashboardStore } from '../store/useDashboardStore';
import { format } from 'date-fns';

const { Title, Text } = Typography;
const { Search } = Input;

const TasksPage: React.FC = React.memo(() => {
  const { taskCompletions, loading, fetchTaskCompletions } = useDashboardStore();
  const [searchText, setSearchText] = useState('');

  // Memoized filtered tasks
  const filteredTasks = useMemo(() => {
    return taskCompletions.filter(task => 
      task.user_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      task.app_name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [taskCompletions, searchText]);

  useEffect(() => {
    fetchTaskCompletions(1, 100); // Fetch first 100 tasks
  }, []);

  const columns = [
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 150,
      render: (name: string, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.user_email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'App',
      dataIndex: 'app_name',
      key: 'app_name',
      width: 120,
      render: (app: string) => (
        <Tag color="blue">{app}</Tag>
      ),
    },
    {
      title: 'Earnings',
      dataIndex: 'earnings',
      key: 'earnings',
      width: 100,
      render: (earnings: number) => (
        <Text style={{ color: '#52c41a', fontWeight: 500 }}>
          KES {earnings.toFixed(2)}
        </Text>
      ),
      sorter: (a: any, b: any) => a.earnings - b.earnings,
    },
    {
      title: 'Duration',
      dataIndex: 'install_duration',
      key: 'install_duration',
      width: 100,
      render: (duration: number) => `${duration}s`,
      sorter: (a: any, b: any) => a.install_duration - b.install_duration,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Badge 
          status={status === 'completed' ? 'success' : status === 'verified' ? 'processing' : 'warning'} 
          text={status} 
        />
      ),
      filters: [
        { text: 'Completed', value: 'completed' },
        { text: 'Verified', value: 'verified' },
        { text: 'Pending', value: 'pending' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
    },
    {
      title: 'Completion Date',
      dataIndex: 'completion_date',
      key: 'completion_date',
      width: 120,
      render: (date: string) => {
        try {
          return format(new Date(date), 'MMM dd, HH:mm');
        } catch (error) {
          return 'Invalid Date';
        }
      },
      sorter: (a: any, b: any) => new Date(a.completion_date).getTime() - new Date(b.completion_date).getTime(),
    },
  ];

  return (
    <div style={{ 
      padding: '12px', 
      background: 'linear-gradient(135deg, #FF006E 0%, #8338EC 25%, #3A86FF 50%, #06FFB4 75%, #FFBE0B 100%)', 
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '12px', textAlign: 'center' }}>
        <Title level={2} style={{ color: 'white', margin: 0, fontSize: 'clamp(20px, 4vw, 24px)' }}>
          📋 Task Management
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'clamp(12px, 3vw, 14px)', display: 'block', marginTop: '4px' }}>
          Monitor and manage user task completions
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
            placeholder="Search tasks..."
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 'clamp(200px, 40vw, 280px)', maxWidth: '100%' }}
            size="small"
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={() => {
              // fetchTaskCompletions();
            }}
            size="small"
          >
            Refresh
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredTasks}
          rowKey="id"
          loading={loading.taskCompletions}
          pagination={{ 
            pageSize: 8,
            size: 'small',
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tasks`,
            simple: true
          }}
          scroll={{ x: 600, y: 300 }}
          size="small"
          style={{ fontSize: 'clamp(11px, 2.5vw, 13px)' }}
        />
      </Card>
    </div>
  );
});

export default TasksPage;
