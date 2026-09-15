import React, { useState } from 'react';
import { Button, Card, Typography, Space } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import PaymentReceipt from '../components/PaymentReceipt';
import { AdminTransaction } from '../lib/supabase';

const { Title, Text } = Typography;

const ReceiptDemoPage: React.FC = () => {
  const [isReceiptVisible, setIsReceiptVisible] = useState(false);

  // Sample transaction data for demo
  const sampleTransaction: AdminTransaction = {
    id: 'demo-12345',
    user_id: 'demo-user-123',
    user_name: 'John Doe',
    user_email: 'john.doe@example.com',
    user_phone: '+254712345678',
    type: 'deposit',
    amount: 1000,
    fee: 50,
    net_amount: 950,
    status: 'completed',
    payment_method: 'M-Pesa',
    description: 'Task completion payment',
    created_at: new Date().toISOString(),
    processed_at: new Date().toISOString(),
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Payment Receipt Demo</Title>
        <Text type="secondary">Test the payment receipt printing functionality</Text>
      </div>

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4}>Sample Transaction</Title>
            <Text>Click the button below to generate a receipt for a sample transaction.</Text>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<FileTextOutlined />}
            onClick={() => setIsReceiptVisible(true)}
          >
            Generate Sample Receipt
          </Button>

          <div style={{ marginTop: 20 }}>
            <Text type="secondary">
              This will open a modal with a beautifully designed receipt that can be printed or saved as PDF.
              The receipt will be pre-filled with sample transaction data.
            </Text>
          </div>
        </Space>
      </Card>

      <PaymentReceipt
        visible={isReceiptVisible}
        onClose={() => setIsReceiptVisible(false)}
        data={sampleTransaction}
        type="transaction"
      />
    </div>
  );
};

export default ReceiptDemoPage;
