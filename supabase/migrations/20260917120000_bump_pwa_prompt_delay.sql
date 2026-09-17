-- Update the default install-prompt delay to 20s so it only appears after the
-- user has had time to sign up / sign in on the web.
UPDATE system_settings
SET value = '20',
    description = 'Seconds after sign-in before showing the install prompt'
WHERE key = 'pwa_prompt_delay_seconds'
  AND value = '5';
