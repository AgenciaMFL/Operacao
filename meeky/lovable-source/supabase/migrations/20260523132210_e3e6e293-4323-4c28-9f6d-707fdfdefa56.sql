
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS utm_term text;

CREATE INDEX IF NOT EXISTS idx_orders_utm_campaign ON public.orders (utm_campaign);
CREATE INDEX IF NOT EXISTS idx_orders_utm_medium ON public.orders (utm_medium);
