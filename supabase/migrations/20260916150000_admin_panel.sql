-- ============================================================
-- ADMIN PANEL MIGRATION
-- 1. users.admin_role / admin_permissions columns
-- 2. is_admin() / has_privilege() SQL helpers (SECURITY DEFINER)
-- 3. Admin RLS policies on every table
-- 4. admin_audit_logs table
-- 5. Grant super_admin + all privileges to wanjalabrighton63@gmail.com
-- ============================================================

-- 1. Columns -----------------------------------------------------
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS admin_role TEXT DEFAULT 'user'
    CHECK (admin_role IN ('user', 'admin', 'super_admin')),
  ADD COLUMN IF NOT EXISTS admin_permissions JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS admin_granted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_granted_by TEXT;

-- 2. Helpers -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND admin_role IN ('admin', 'super_admin')
      AND is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION public.has_privilege(p TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND admin_role IN ('admin', 'super_admin')
      AND is_active = TRUE
      AND (
        admin_permissions @> '["*"]'::jsonb
        OR admin_permissions @> to_jsonb(ARRAY[p]::text[])
      )
  );
$$;

-- 3. Audit table -------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  admin_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB,
  ip_address INET
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_logs(created_at DESC);
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY admins_read_audit ON admin_audit_logs
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY admins_insert_audit ON admin_audit_logs
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- 4. Admin RLS policies -------------------------------------------
-- Users: admins read all; admins update users (wallet ops, activation, roles).
-- Field-level restrictions are enforced in the app layer by privilege checks + audit log.
CREATE POLICY admins_read_users ON users
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY admins_update_users ON users
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users a WHERE a.id = auth.uid() AND a.admin_role IN ('admin','super_admin') AND a.is_active))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users a WHERE a.id = auth.uid() AND a.admin_role IN ('admin','super_admin') AND a.is_active));

-- Transactional & activity data: admins read all
CREATE POLICY admins_read_transactions ON transactions
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY admins_read_investments ON investments
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY admins_read_tasks ON task_completions
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY admins_read_spins ON spin_attempts
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY admins_read_referrals ON referrals
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY admins_read_withdrawals ON withdrawal_requests
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY admins_update_withdrawals ON withdrawal_requests
  FOR UPDATE TO authenticated USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY admins_insert_withdrawals ON withdrawal_requests
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY admins_read_notifications ON notifications
  FOR ALL TO authenticated USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY admins_read_gifts ON gift_codes
  FOR ALL TO authenticated USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY admins_read_redemptions ON gift_code_redemptions
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY admins_read_levels ON levels
  FOR ALL TO authenticated USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY admins_read_settings ON system_settings
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY admins_update_settings ON system_settings
  FOR UPDATE TO authenticated USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY admins_read_stats ON daily_statistics
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY admins_read_banks ON kenyan_banks
  FOR ALL TO authenticated USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY admins_read_activity ON activity_logs
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY admins_read_callbacks ON payment_callbacks
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY admins_read_activations ON activation_payments
  FOR SELECT TO authenticated USING (public.is_admin());

-- 5. Grant super admin --------------------------------------------
UPDATE users
SET admin_role = 'super_admin',
    admin_permissions = '["*"]'::jsonb,
    admin_granted_at = NOW(),
    admin_granted_by = 'migration'
WHERE email = 'wanjalabrighton63@gmail.com';
