
-- Add pix_key to coupons
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS pix_key TEXT;

-- Create partner_payments table for monthly closings
CREATE TABLE public.partner_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  partner_name TEXT NOT NULL,
  month TEXT NOT NULL, -- format: YYYY-MM
  sales_count INTEGER NOT NULL DEFAULT 0,
  bonus_amount NUMERIC NOT NULL DEFAULT 0,
  pix_key TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_payments ENABLE ROW LEVEL SECURITY;

-- Only service role can manage
CREATE POLICY "Service role full access on partner_payments"
ON public.partner_payments
FOR ALL
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- Unique constraint per coupon per month
CREATE UNIQUE INDEX idx_partner_payments_coupon_month ON public.partner_payments (coupon_id, month);
