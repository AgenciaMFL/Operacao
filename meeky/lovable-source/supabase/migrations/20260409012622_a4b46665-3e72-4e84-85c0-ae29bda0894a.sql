
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_phone text DEFAULT '',
  ADD COLUMN IF NOT EXISTS shipping_street text DEFAULT '',
  ADD COLUMN IF NOT EXISTS shipping_number text DEFAULT '',
  ADD COLUMN IF NOT EXISTS shipping_complement text DEFAULT '',
  ADD COLUMN IF NOT EXISTS shipping_neighborhood text DEFAULT '',
  ADD COLUMN IF NOT EXISTS shipping_city text DEFAULT '',
  ADD COLUMN IF NOT EXISTS shipping_state text DEFAULT '',
  ADD COLUMN IF NOT EXISTS shipping_cep text DEFAULT '',
  ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS product_name text DEFAULT 'Headphone Meeky ANC Premium';
