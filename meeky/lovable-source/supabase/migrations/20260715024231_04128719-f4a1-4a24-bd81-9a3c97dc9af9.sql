
CREATE TABLE public.abandoned_checkouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,
  name TEXT,
  product_id TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  coupon_code TEXT,
  converted_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  recovery_email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT, UPDATE ON public.abandoned_checkouts TO anon;
GRANT INSERT, UPDATE ON public.abandoned_checkouts TO authenticated;
GRANT ALL ON public.abandoned_checkouts TO service_role;

ALTER TABLE public.abandoned_checkouts ENABLE ROW LEVEL SECURITY;

-- Anyone can create a draft checkout (session_token is a client-generated UUID that acts as a capability).
CREATE POLICY "Anyone can insert an abandoned checkout draft"
  ON public.abandoned_checkouts
  FOR INSERT
  WITH CHECK (true);

-- Anyone can update rows (session_token in the WHERE clause acts as the capability).
-- We do NOT allow updating converted_order_id or recovery_email_sent_at from the client via a trigger below.
CREATE POLICY "Anyone can update their own abandoned checkout"
  ON public.abandoned_checkouts
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Prevent client-side tampering with server-only fields.
CREATE OR REPLACE FUNCTION public.abandoned_checkouts_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) IN ('anon', 'authenticated') THEN
    NEW.converted_order_id := OLD.converted_order_id;
    NEW.recovery_email_sent_at := OLD.recovery_email_sent_at;
    NEW.session_token := OLD.session_token;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER abandoned_checkouts_guard_trg
  BEFORE UPDATE ON public.abandoned_checkouts
  FOR EACH ROW EXECUTE FUNCTION public.abandoned_checkouts_guard();

CREATE INDEX idx_abandoned_checkouts_recovery
  ON public.abandoned_checkouts (created_at)
  WHERE converted_order_id IS NULL AND recovery_email_sent_at IS NULL;
