-- Unify the WhatsApp settings keys so that what the admin panel edits is
-- exactly what the app reads.
--
-- Before:
--   DB seed:          whatsapp_customer_care   (old key, still in some DBs)
--   Panel edits:      whatsapp_support_number
--   HomeScreen reads: whatsapp_support_number  ✓ (but see seed mismatch)
--   AccountScreen:    support_phone            ✗ wrong key — never populated
--
-- After: everything uses whatsapp_support_number (+ whatsapp_group_link,
-- + whatsapp_support_message). Old values are carried over.

-- Carry the legacy seeded value over if the new key is missing.
INSERT INTO system_settings (key, value, description)
SELECT 'whatsapp_support_number', value, 'WhatsApp customer care number'
FROM system_settings
WHERE key = 'whatsapp_customer_care'
  AND NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'whatsapp_support_number');

-- Retire the legacy key.
DELETE FROM system_settings WHERE key = 'whatsapp_customer_care';

-- AccountScreen used to read support_phone; point it at the canonical key.
INSERT INTO system_settings (key, value, description)
SELECT 'support_phone', value, 'Support phone (kept in sync with WhatsApp customer care number)'
FROM system_settings
WHERE key = 'whatsapp_support_number'
  AND NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'support_phone');

-- Description pre-filled WhatsApp chat message.
INSERT INTO system_settings (key, value, description)
SELECT 'whatsapp_support_message', 'Hello Gig-Smart Support, I need assistance with my account.',
       'Pre-filled message when users open a WhatsApp support chat'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'whatsapp_support_message');

UPDATE system_settings
SET description = 'WhatsApp customer care number (digits with country code, e.g. 254712345678)'
WHERE key = 'whatsapp_support_number';
