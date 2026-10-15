ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_real_cost NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS shipping_service_name TEXT;