-- ============================================================
-- PWA TRACKING + ADMIN EXPANSION
-- 1. users: PWA install/session tracking columns
-- 2. pwa_events: browser/install analytics for the admin panel
-- 3. levels.run_days: editable work duration per level
-- 4. system_settings: PWA + platform defaults (additive seeds)
-- ============================================================

-- 1. PWA columns on users ------------------------------------------------
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS install_prompt_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_install_prompt_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS installed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS display_standalone BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sessions_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- 2. pwa_events -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pwa_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event TEXT NOT NULL CHECK (event IN ('page_view','beforeinstallprompt','install_accepted','installed','app_opened','session_start')),
  platform TEXT,
  user_agent TEXT,
  session_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_pwa_events_user ON public.pwa_events(user_id);
CREATE INDEX IF NOT EXISTS idx_pwa_events_created ON public.pwa_events(created_at DESC);

ALTER TABLE public.pwa_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pwa_events_insert ON public.pwa_events;
CREATE POLICY pwa_events_insert ON public.pwa_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS pwa_events_admin_read ON public.pwa_events;
CREATE POLICY pwa_events_admin_read ON public.pwa_events
  FOR SELECT TO authenticated USING (public.is_admin());

-- 3. levels.run_days -------------------------------------------------------
ALTER TABLE public.levels ADD COLUMN IF NOT EXISTS run_days INTEGER NOT NULL DEFAULT 7;

-- 4. Settings seeds (additive — never overwrite existing values) -----------
INSERT INTO system_settings (key, value, description)
SELECT k.v, k.d
FROM (VALUES
  ('pwa_install_prompt', 'enabled', 'PWA install prompt: enabled / disabled'),
  ('pwa_prompt_every_visit', 'true', 'Prompt to install on every visit until installed'),
  ('pwa_prompt_delay_seconds', '5', 'Seconds after page load before showing the install prompt'),
  ('pwa_ios_banner', 'enabled', 'Show iOS add-to-home-screen guidance banner'),
  ('maintenance_mode', 'false', 'When true, the app shows a maintenance notice')
) AS k(v, d)
WHERE NOT EXISTS (SELECT 1 FROM system_settings s WHERE s.key = k.v);
