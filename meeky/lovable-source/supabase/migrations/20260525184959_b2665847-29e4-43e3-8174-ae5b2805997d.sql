ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS subtotal_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS final_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS idempotency_key text;

CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_key_unique 
  ON public.orders (idempotency_key) 
  WHERE idempotency_key IS NOT NULL;