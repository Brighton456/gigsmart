import React, { useEffect, useRef } from 'react';
import { Button, Modal } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import html2pdf from 'html2pdf.js';
import { AdminTransaction, AdminWithdrawalRequest } from '../lib/supabase';

interface PaymentReceiptProps {
  visible: boolean;
  onClose: () => void;
  data?: AdminTransaction | AdminWithdrawalRequest;
  type: 'transaction' | 'withdrawal';
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ 
  visible, 
  onClose, 
  data, 
  type 
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const generateReceiptId = () => 'GS' + Math.floor(Math.random() * 90000 + 10000);
  const generateReference = () => Math.random().toString(36).substr(2, 7).toUpperCase();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return '#2563eb';
      case 'pending':
        return '#ca8a04';
      case 'rejected':
      case 'void':
        return '#dc2626';
      default:
        return '#2563eb';
    }
  };

  const getReceiptData = () => {
    if (!data) return null;

    if (type === 'transaction') {
      const transaction = data as AdminTransaction;
      return {
        id: generateReceiptId(),
        reference: generateReference(),
        date: new Date().toLocaleDateString('en-GB'),
        customerName: transaction.user_name || 'Customer',
        customerEmail: transaction.user_email || 'customer@example.com',
        customerPhone: transaction.user_phone || 'N/A',
        amount: transaction.amount || 0, // Gross amount for deposits
        tax: transaction.fee || 0,
        status: transaction.status === 'completed' ? 'PAID' : 
                transaction.status === 'pending' ? 'PENDING' : 'VOID',
        method: transaction.payment_method || 'Unknown',
        paidTime: transaction.processed_at 
          ? new Date(transaction.processed_at).toLocaleString('en-GB')
          : new Date().toLocaleString('en-GB'),
        description: transaction.description || 'Payment Transaction'
      };
    } else {
      const withdrawal = data as AdminWithdrawalRequest;
      // For withdrawals: total paid = withdrawal amount - fee - tax
      const withdrawalAmount = withdrawal.amount || 0;
      const withdrawalFee = withdrawal.fee || 0;
      const withdrawalTax = 0; // Tax property doesn't exist in AdminWithdrawalRequest
      const totalPaid = withdrawalAmount - withdrawalFee - withdrawalTax;
      
      return {
        id: generateReceiptId(),
        reference: generateReference(),
        date: new Date().toLocaleDateString('en-GB'),
        customerName: withdrawal.user_name || 'Customer',
        customerEmail: withdrawal.user_email || 'customer@example.com',
        customerPhone: withdrawal.user_phone || 'N/A',
        amount: withdrawalAmount, // Gross withdrawal amount
        tax: withdrawalFee + withdrawalTax, // Total deductions
        status: withdrawal.status === 'completed' ? 'PAID' : 
                withdrawal.status === 'pending' ? 'PENDING' : 'VOID',
        method: withdrawal.payment_method || 'Unknown',
        paidTime: withdrawal.processed_at 
          ? new Date(withdrawal.processed_at).toLocaleString('en-GB')
          : new Date().toLocaleString('en-GB'),
        description: `Withdrawal Request - ${withdrawal.withdrawal_account_type}`,
        totalPaid: totalPaid // Net amount actually paid
      };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!receiptRef.current) return;
    
    const opt = {
      margin: 10,
      filename: `receipt-${receiptData?.id || 'unknown'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: [80, 200] as [number, number], orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(receiptRef.current).save();
  };

  const receiptData = getReceiptData();
  const statusColor = receiptData ? getStatusColor(receiptData.status) : '#2563eb';

  if (!receiptData) return null;

  return (
    <>
      <style>{`
        .receipt-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .receipt-paper {
          background: white;
          width: 80mm;
          min-height: 200mm;
          padding: 30px 20px;
          box-sizing: border-box;
          position: relative;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          border-radius: 4px;
          overflow: hidden;
        }

        .seal-bg {
          position: absolute;
          top: 40px;
          left: 50%;
          transform: translateX(-50%) rotate(-5deg);
          width: 140px;
          height: 140px;
          border: 1px solid ${statusColor};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 10px;
          font-weight: bold;
          color: ${statusColor};
          opacity: 0.1;
          z-index: 1;
          pointer-events: none;
        }

        .stamp-overlay {
          position: absolute;
          top: 260px;
          left: 50%;
          transform: translateX(-50%) rotate(-15deg);
          border: 3px solid ${statusColor};
          padding: 6px 20px;
          font-size: 32px;
          font-weight: 900;
          color: ${statusColor};
          text-transform: uppercase;
          border-radius: 4px;
          opacity: 0.15;
          mix-blend-mode: multiply;
          z-index: 1;
          pointer-events: none;
        }

        .receipt-content {
          position: relative;
          z-index: 2;
        }

        .header { 
          text-align: center; 
          margin-bottom: 30px; 
        }
        
        .logo { 
          font-size: 26px; 
          font-weight: 800; 
          color: #2563eb; 
          margin: 0; 
        }
        
        .sub-header { 
          font-size: 10px; 
          color: #64748b; 
          text-transform: uppercase; 
          letter-spacing: 2px; 
        }

        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 11px;
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
          padding: 12px 0;
          margin-bottom: 20px;
        }

        .customer-box { 
          margin-bottom: 20px; 
        }
        
        .customer-label { 
          font-size: 9px; 
          text-transform: uppercase; 
          color: #2563eb; 
          font-weight: bold; 
        }
        
        .customer-name { 
          font-size: 15px; 
          font-weight: bold; 
          margin: 2px 0; 
        }
        
        .customer-detail { 
          font-size: 11px; 
          color: #64748b; 
        }

        .table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 20px; 
        }
        
        .table-head { 
          border-bottom: 2px solid #1e293b; 
          text-align: left; 
          font-size: 11px; 
        }
        
        .table-row td { 
          padding: 10px 0; 
          font-size: 13px; 
        }

        .total-section {
          border-top: 1px solid #f1f5f9;
          padding-top: 10px;
        }
        
        .total-row { 
          display: flex; 
          justify-content: space-between; 
          padding: 4px 0; 
          font-size: 12px; 
        }
        
        .grand-total { 
          font-size: 18px; 
          font-weight: 800; 
          margin-top: 10px; 
          border-top: 1px solid #000; 
          padding-top: 10px; 
        }

        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 10px;
          color: #64748b;
          border-top: 1px dashed #e2e8f0;
          padding-top: 20px;
        }

        @media print {
          .ant-modal-content .ant-modal-body .receipt-actions {
            display: none !important;
          }
          .ant-modal-content {
            background: white;
            box-shadow: none;
          }
          .receipt-paper {
            box-shadow: none;
            border: none;
            width: 100%;
            max-width: none;
          }
        }
      `}</style>

      <Modal
        title="Payment Receipt"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={400}
        centered
        className="receipt-container"
      >
        <div className="receipt-paper" ref={receiptRef}>
          {/* STAMPS */}
          <div className="seal-bg">
            OFFICIAL RECEIPT<br/>
            GIG-SMART FINANCE<br/>
            VALIDATED
          </div>
          <div className="stamp-overlay">
            {receiptData.status}
          </div>

          <div className="receipt-content">
            <div className="header">
              <h1 className="logo">GIG-SMART</h1>
              <div className="sub-header">Official Payment Receipt</div>
            </div>

            <div className="info-grid">
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <span>Receipt: <b>{receiptData.id}</b></span>
                <span>Ref: <b>{receiptData.reference}</b></span>
              </div>
              <div>Date: <b>{receiptData.date}</b></div>
            </div>

            <div className="customer-box">
              <div className="customer-label">Billed To</div>
              <div className="customer-name">{receiptData.customerName}</div>
              <div className="customer-detail">{receiptData.customerEmail}</div>
              <div className="customer-detail">{receiptData.customerPhone}</div>
            </div>

            <table className="table">
              <tbody>
                <tr className="table-head">
                  <th style={{paddingBottom:'5px'}}>Description</th>
                  <th style={{textAlign:'right', paddingBottom:'5px'}}>Amount</th>
                </tr>
                <tr className="table-row">
                  <td>{receiptData.description}</td>
                  <td style={{textAlign:'right'}}>
                    {receiptData.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="total-section">
              <div className="total-row">
                <span>Subtotal</span>
                <span>{receiptData.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="total-row">
                <span>Fee & Tax Deductions</span>
                <span>-{receiptData.tax.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="total-row" style={{marginTop:'5px'}}>
                <span>Method</span>
                <span style={{fontWeight:'bold'}}>{receiptData.method}</span>
              </div>
              <div className="total-row grand-total">
                <span>TOTAL {type === 'withdrawal' ? 'PAID' : 'RECEIVED'}</span>
                <span>
                  {type === 'withdrawal' 
                    ? (receiptData.totalPaid || (receiptData.amount - receiptData.tax)).toLocaleString(undefined, {minimumFractionDigits: 2})
                    : (receiptData.amount + receiptData.tax).toLocaleString(undefined, {minimumFractionDigits: 2})
                  }
                </span>
              </div>
            </div>

            <div className="footer">
              <p>Paid On: <b>{receiptData.paidTime}</b></p>
              <p style={{marginTop:'10px'}}>Thank you for your business!</p>
              <p style={{fontSize:'8px'}}>Gig-Smart Company Ltd. | Nairobi, Kenya</p>
              <p style={{fontWeight:'bold', marginTop:'10px'}}>*** END OF RECEIPT ***</p>
            </div>
          </div>
        </div>

        <div className="receipt-actions" style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
          <Button 
            icon={<PrinterOutlined />} 
            onClick={handlePrint}
            style={{flex: 1}}
          >
            Print
          </Button>
          <Button 
            type="primary"
            icon={<DownloadOutlined />} 
            onClick={handleDownloadPDF}
            style={{flex: 1}}
          >
            Save PDF
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default PaymentReceipt;
