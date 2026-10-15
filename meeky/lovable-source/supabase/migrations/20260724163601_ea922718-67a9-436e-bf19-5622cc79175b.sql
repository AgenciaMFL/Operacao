ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_notified_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_orders_tracking_pending
  ON public.orders (payment_status, tracking_notified_at)
  WHERE payment_status = 'approved' AND tracking_notified_at IS NULL AND shipping_order_id IS NOT NULL;