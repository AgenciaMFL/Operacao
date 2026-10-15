ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON public.coupons(expires_at);