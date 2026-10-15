ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS landing_referrer TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_source TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_content TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_term TEXT;