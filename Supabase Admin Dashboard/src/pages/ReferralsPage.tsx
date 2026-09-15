import React, { useEffect } from 'react';
import { Card, Typography, Table, Tag, Space, Button } from 'antd';
import { TeamOutlined, ReloadOutlined } from '@ant-design/icons';
import { useDashboardStore } from '../store/useDashboardStore';

const { Title } = Typography;

const ReferralsPage: React.FC = () => {
  const { referrals, loading, fetchReferrals } = useDashboardStore();

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const columns = [
    {
      title: 'Referrer',
      dataIndex: 'referrer_name',
      key: 'referrer_name',
    },
    {
      title: 'Referred User',
      dataIndex: 'referred_name',
      key: 'referred_name',
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level: number) => <Tag color="blue">Level {level}</Tag>,
    },
    {
      title: 'Total Earnings',
      dataIndex: 'total_earnings',
      key: 'total_earnings',
      render: (earnings: number) => `KES ${earnings.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Referrals</Title>
      </div>
      <Card
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => fetchReferrals()}>
            Refresh
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={referrals}
          rowKey="id"
          loading={loading.referrals}
        />
      </Card>
    </div>
  );
};

export default ReferralsPage;
