ALTER TABLE public.abandoned_checkouts
  ADD COLUMN IF NOT EXISTS admin_alert_had_phone boolean,
  ADD COLUMN IF NOT EXISTS admin_alert_phone_update_sent_at timestamp with time zone;