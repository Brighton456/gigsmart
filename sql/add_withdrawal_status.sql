-- Fix Issue #7 & #8: Withdrawal requests table separation and status management
-- Problem: Withdrawal requests appear in transactions table but not in separate withdrawal_requests table
-- Solution: Create proper withdrawal_requests table with status field and separation from transactions

-- Create withdrawal_requests table with proper structure
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    fee DECIMAL(12,2) DEFAULT 0,
    net_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    payment_method VARCHAR(50),
    payment_details JSONB,
    user_name VARCHAR(255),
    user_phone VARCHAR(20),
    user_email VARCHAR(255),
    transaction_id UUID REFERENCES transactions(id),
    admin_notes TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at DESC);

-- Function to create withdrawal request
CREATE OR REPLACE FUNCTION create_withdrawal_request(
    user_uuid UUID,
    req_amount DECIMAL,
    req_fee DECIMAL,
    req_net_amount DECIMAL,
    req_payment_method VARCHAR,
    req_payment_details JSONB,
    req_user_meta JSONB
)
RETURNS UUID AS $$
DECLARE
    request_id UUID;
BEGIN
    -- Insert withdrawal request
    INSERT INTO withdrawal_requests (
        user_id, amount, fee, net_amount, status,
        payment_method, payment_details, user_name, user_phone, user_email
    ) VALUES (
        user_uuid, req_amount, req_fee, req_net_amount, 'pending',
        req_payment_method, req_payment_details, 
        req_user_meta->>'name', req_user_meta->>'phone', req_user_meta->>'email'
    ) 
    RETURNING id INTO request_id;
    
    RETURN request_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update withdrawal request status
CREATE OR REPLACE FUNCTION update_withdrawal_status(
    request_id UUID,
    new_status VARCHAR,
    admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update withdrawal request status
    UPDATE withdrawal_requests 
    SET 
        status = new_status,
        admin_notes = admin_notes,
        processed_at = CASE 
            WHEN new_status IN ('approved', 'rejected') THEN NOW()
            ELSE processed_at 
        END,
        updated_at = NOW()
    WHERE id = request_id;
    
    -- Return true if update was successful
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to get withdrawal requests for user
CREATE OR REPLACE FUNCTION get_user_withdrawal_requests(user_uuid UUID, limit_count INT DEFAULT 10)
RETURNS TABLE (
    id UUID,
    amount DECIMAL,
    fee DECIMAL,
    net_amount DECIMAL,
    status VARCHAR,
    payment_method VARCHAR,
    created_at TIMESTAMP,
    processed_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wr.id,
        wr.amount,
        wr.fee,
        wr.net_amount,
        wr.status,
        wr.payment_method,
        wr.created_at,
        wr.processed_at
    FROM withdrawal_requests wr
    WHERE wr.user_id = user_uuid
    ORDER BY wr.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- View for withdrawal requests with user details
CREATE OR REPLACE VIEW withdrawal_requests_summary AS
SELECT 
    wr.id,
    wr.user_id,
    u.username,
    u.phone as user_phone,
    u.email as user_email,
    wr.amount,
    wr.fee,
    wr.net_amount,
    wr.status,
    wr.payment_method,
    wr.user_name,
    wr.admin_notes,
    wr.created_at,
    wr.processed_at,
    wr.updated_at,
    -- Payment details from JSON
    CASE 
        WHEN wr.payment_details IS NOT NULL THEN 
            json_extract_path_text(wr.payment_details, '$.account_name')
        ELSE NULL
    END as payment_account_name,
    -- Status styling for frontend
    CASE 
        WHEN wr.status = 'pending' THEN 'warning'
        WHEN wr.status = 'approved' THEN 'success'
        WHEN wr.status = 'rejected' THEN 'error'
        ELSE 'default'
    END as status_style
FROM withdrawal_requests wr
LEFT JOIN users u ON wr.user_id = u.id;

-- Create trigger to log withdrawal request status changes
CREATE OR REPLACE FUNCTION log_withdrawal_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status change events
    INSERT INTO activity_logs (
        user_id, action, details, created_at
    ) VALUES (
        NEW.user_id, 
        'withdrawal_status_change', 
        json_build_object(
            'request_id', NEW.id,
            'old_status', OLD.status,
            'new_status', NEW.status,
            'changed_at', NOW()
        ),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS log_withdrawal_status_change_trigger ON withdrawal_requests;

-- Create new trigger
CREATE TRIGGER log_withdrawal_status_change_trigger
    AFTER UPDATE ON withdrawal_requests
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION log_withdrawal_status_change();
