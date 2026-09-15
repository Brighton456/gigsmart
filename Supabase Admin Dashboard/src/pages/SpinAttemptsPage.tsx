import React, { useEffect } from 'react';
import { Card, Typography, Table, Tag, Space, Button } from 'antd';
import { GiftOutlined, ReloadOutlined } from '@ant-design/icons';
import { useDashboardStore } from '../store/useDashboardStore';

const { Title } = Typography;

const SpinAttemptsPage: React.FC = () => {
  const { spinAttempts, loading, fetchSpinAttempts } = useDashboardStore();

  useEffect(() => {
    fetchSpinAttempts();
  }, [fetchSpinAttempts]);

  const columns = [
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
    },
    {
      title: 'Prize Won',
      dataIndex: 'prize_won',
      key: 'prize_won',
      render: (prize: string) => <Tag color="gold">{prize}</Tag>,
    },
    {
      title: 'Prize Value',
      dataIndex: 'prize_value',
      key: 'prize_value',
      render: (value: number) => `KES ${value.toFixed(2)}`,
    },
    {
      title: 'Spin Date',
      dataIndex: 'spin_date',
      key: 'spin_date',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Spin Attempts</Title>
      </div>
      <Card
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => fetchSpinAttempts()}>
            Refresh
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={spinAttempts}
          rowKey="id"
          loading={loading.spinAttempts}
        />
      </Card>
    </div>
  );
};

export default SpinAttemptsPage;
