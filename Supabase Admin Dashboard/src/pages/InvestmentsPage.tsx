import React, { useEffect } from 'react';
import { Card, Typography, Table, Tag, Space, Button } from 'antd';
import { BankOutlined, ReloadOutlined } from '@ant-design/icons';
import { useDashboardStore } from '../store/useDashboardStore';

const { Title } = Typography;

const InvestmentsPage: React.FC = () => {
  const { investments, loading, fetchInvestments } = useDashboardStore();

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const columns = [
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `KES ${amount.toFixed(2)}`,
    },
    {
      title: 'Daily Rate',
      dataIndex: 'daily_rate',
      key: 'daily_rate',
      render: (rate: number) => `${(rate * 100).toFixed(2)}%`,
    },
    {
      title: 'Duration',
      dataIndex: 'duration_days',
      key: 'duration_days',
      render: (days: number) => `${days} days`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Investments</Title>
      </div>
      <Card
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => fetchInvestments()}>
            Refresh
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={investments}
          rowKey="id"
          loading={loading.investments}
        />
      </Card>
    </div>
  );
};

export default InvestmentsPage;
