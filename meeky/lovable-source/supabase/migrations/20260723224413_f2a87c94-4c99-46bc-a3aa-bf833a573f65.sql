
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS mp_status_detail text,
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  previous_status text,
  new_status text NOT NULL,
  mp_status_detail text,
  mp_payment_id text,
  source text NOT NULL DEFAULT 'mercadopago-webhook',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, new_status, mp_payment_id)
);

GRANT ALL ON public.order_status_history TO service_role;

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on order_status_history"
  ON public.order_status_history
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON public.order_status_history(order_id);
