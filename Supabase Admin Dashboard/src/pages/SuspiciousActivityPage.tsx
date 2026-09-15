import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Typography, 
  Table, 
  Tag, 
  Space, 
  Button, 
  Modal, 
  Form, 
  Input,
  Select,
  message,
  Badge
} from 'antd';
import { 
  SecurityScanOutlined, 
  ReloadOutlined,
  CheckOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useDashboardStore } from '../store/useDashboardStore';
import { SuspiciousActivity } from '../lib/supabase';

const { Title } = Typography;
const { TextArea } = Input;

const SuspiciousActivityPage: React.FC = () => {
  const { 
    suspiciousActivities, 
    loading, 
    fetchSuspiciousActivities, 
    updateSuspiciousActivity 
  } = useDashboardStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<SuspiciousActivity | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSuspiciousActivities();
  }, [fetchSuspiciousActivities]);

  const handleReview = (activity: SuspiciousActivity) => {
    setSelectedActivity(activity);
    form.setFieldsValue({
      status: activity.status,
      admin_notes: (activity as any).admin_notes || '',
    });
    setIsModalVisible(true);
  };

  const handleUpdate = async (values: any) => {
    if (!selectedActivity) return;

    try {
      await updateSuspiciousActivity(selectedActivity.id, {
        ...values,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'Admin', // In real app, this would be the logged-in user
      });
      message.success('Activity updated successfully!');
      setIsModalVisible(false);
      setSelectedActivity(null);
      form.resetFields();
    } catch (error) {
      message.error('Failed to update activity');
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'red';
    if (score >= 60) return 'orange';
    if (score >= 40) return 'yellow';
    return 'green';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed': return 'success';
      case 'pending': return 'processing';
      case 'flagged': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Activity Type',
      dataIndex: 'activity_type',
      key: 'activity_type',
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Risk Score',
      dataIndex: 'risk_score',
      key: 'risk_score',
      render: (score: number) => (
        <Badge 
          count={score} 
          style={{ backgroundColor: getRiskScoreColor(score) }}
        />
      ),
      sorter: (a: SuspiciousActivity, b: SuspiciousActivity) => a.risk_score - b.risk_score,
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={getStatusColor(status) as any}
          text={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SuspiciousActivity) => (
        <Space>
          <Button
            type="link"
            icon={<CheckOutlined />}
            onClick={() => handleReview(record)}
          >
            Review
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Suspicious Activity</Title>
      </div>
      <Card
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => fetchSuspiciousActivities()}>
            Refresh
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={suspiciousActivities}
          rowKey="id"
          loading={loading.suspiciousActivities}
        />
      </Card>

      <Modal
        title="Review Suspicious Activity"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedActivity(null);
        }}
        footer={null}
        width={600}
      >
        {selectedActivity && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdate}
          >
            <Form.Item label="Activity Type">
              <Input value={selectedActivity.activity_type} disabled />
            </Form.Item>

            <Form.Item label="Description">
              <TextArea value={selectedActivity.description} disabled rows={3} />
            </Form.Item>

            <Form.Item label="Risk Score">
              <Input 
                value={selectedActivity.risk_score} 
                disabled 
                addonAfter={
                  <Badge 
                    count={selectedActivity.risk_score} 
                    style={{ backgroundColor: getRiskScoreColor(selectedActivity.risk_score) }}
                  />
                }
              />
            </Form.Item>

            <Form.Item label="IP Address">
              <Input value={selectedActivity.ip_address} disabled />
            </Form.Item>

            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: 'Please select status!' }]}
            >
              <Select>
                <Select.Option value="pending">Pending</Select.Option>
                <Select.Option value="reviewed">Reviewed</Select.Option>
                <Select.Option value="flagged">Flagged</Select.Option>
                <Select.Option value="resolved">Resolved</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Admin Notes"
              name="admin_notes"
            >
              <TextArea rows={4} placeholder="Add your review notes here..." />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Update Activity
                </Button>
                <Button onClick={() => {
                  setIsModalVisible(false);
                  setSelectedActivity(null);
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default SuspiciousActivityPage;
