import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useAuthStore } from '../store/useAuthStore';

const { Title, Text } = Typography;

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const { user, signIn, loading, error } = useAuthStore();
  const [localLoading, setLocalLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const onFinish = async (values: LoginForm) => {
    setLocalLoading(true);
    try {
      await signIn(values.email, values.password);
      message.success('Login successful!');
    } catch (error) {
      message.error('Login failed. Please check your credentials.');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          borderRadius: '16px'
        }}
        styles={{ body: { padding: '40px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '24px',
            margin: '0 auto 16px'
          }}>
            A
          </div>
          <Title level={2} style={{ margin: 0, color: '#262626' }}>
            Admin Dashboard
          </Title>
          <Text type="secondary">
            Sign in to manage your platform
          </Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email address"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              autoComplete="current-password"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          {error && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              background: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: '6px',
              color: '#ff4d4f',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading || localLoading}
              block
              style={{
                height: '48px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontSize: '16px',
                fontWeight: 500
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '24px 0' }}>
          <Text type="secondary">Admin Access</Text>
        </Divider>

        <Space orientation="vertical" size="small" style={{ width: '100%' }}>
          <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center', display: 'block' }}>
            This dashboard is for authorized administrators only.
          </Text>
          <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center', display: 'block' }}>
            Contact your system administrator if you need access.
          </Text>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;
