import React from 'react';
import { Card, Typography, Form, Input, Button, Switch, Space, message, Row, Col } from 'antd';
import { SettingOutlined, SaveOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();

  const handleSave = async (values: any) => {
    try {
      // In a real app, this would save to Supabase system_settings table
      console.log('Saving settings:', values);
      message.success('Settings saved successfully!');
    } catch (error) {
      message.error('Failed to save settings');
    }
  };

  return (
    <div style={{ padding: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <Title level={2} style={{ color: 'white', margin: 0, fontSize: '24px' }}>
          ⚙️ Settings
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', display: 'block', marginTop: '8px' }}>
          Configure platform settings and preferences
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
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            siteName: 'Earnings Platform',
            maintenanceMode: false,
            allowRegistrations: true,
            minWithdrawalAmount: 100,
            referralBonusPercentage: 10,
            dailyTaskLimit: 10,
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card size="small" style={{ borderRadius: '8px', marginBottom: '16px' }}>
                <Title level={5} style={{ color: '#667eea', marginBottom: '12px' }}>⚙️ General Settings</Title>
                
                <Form.Item
                  label="Site Name"
                  name="siteName"
                  rules={[{ required: true, message: 'Please input site name!' }]}
                >
                  <Input size="small" />
                </Form.Item>

                <Form.Item
                  label="Maintenance Mode"
                  name="maintenanceMode"
                  valuePropName="checked"
                >
                  <Switch size="small" />
                </Form.Item>

                <Form.Item
                  label="Allow New Registrations"
                  name="allowRegistrations"
                  valuePropName="checked"
                >
                  <Switch size="small" />
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card size="small" style={{ borderRadius: '8px', marginBottom: '16px' }}>
                <Title level={5} style={{ color: '#4ECDC4', marginBottom: '12px' }}>💰 Financial Settings</Title>

                <Form.Item
                  label="Minimum Withdrawal (KES)"
                  name="minWithdrawalAmount"
                  rules={[{ required: true, message: 'Please input minimum withdrawal amount!' }]}
                >
                  <Input type="number" size="small" />
                </Form.Item>

                <Form.Item
                  label="Referral Bonus (%)"
                  name="referralBonusPercentage"
                  rules={[{ required: true, message: 'Please input referral bonus percentage!' }]}
                >
                  <Input type="number" min={0} max={100} size="small" />
                </Form.Item>

                <Form.Item
                  label="Daily Task Limit"
                  name="dailyTaskLimit"
                  rules={[{ required: true, message: 'Please input daily task limit!' }]}
                >
                  <Input type="number" min={1} size="small" />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              size="large"
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                minWidth: '150px'
              }}
            >
              Save Settings
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage;
