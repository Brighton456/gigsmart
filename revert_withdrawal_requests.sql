-- REVERT WITHDRAWAL REQUESTS
-- This will restore the withdrawal requests section that was accidentally removed

-- 9. WITHDRAWAL REQUESTS
INSERT INTO withdrawal_requests (id, user_id, transaction_id, amount, fee, net_amount, status, payment_method, payment_details, requested_at, processed_at, external_reference) VALUES
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', gen_random_uuid(), 500.00, 25.00, 475.00, 'completed', 'mpesa', '{"type": "mpesa", "phone": "0768741104", "display": "M-Pesa: 0768741104"}', '2025-11-30 15:00:00+03', '2025-11-30 15:30:00+03', 'MP789012'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', gen_random_uuid(), 700.00, 35.00, 665.00, 'completed', 'mpesa', '{"type": "mpesa", "phone": "0768741104", "display": "M-Pesa: 0768741104"}', '2025-12-28 16:15:00+03', '2025-12-28 16:45:00+03', 'MP789013');
