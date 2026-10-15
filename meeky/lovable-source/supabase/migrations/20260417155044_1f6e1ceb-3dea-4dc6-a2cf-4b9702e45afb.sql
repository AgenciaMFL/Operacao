-- 1. Tabela de eventos de clique nos links de parceiros
CREATE TABLE public.partner_link_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,
  coupon_code TEXT NOT NULL,
  session_id TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_partner_link_events_coupon ON public.partner_link_events(coupon_code);
CREATE INDEX idx_partner_link_events_slug ON public.partner_link_events(slug);
CREATE INDEX idx_partner_link_events_created_at ON public.partner_link_events(created_at DESC);
CREATE INDEX idx_partner_link_events_session ON public.partner_link_events(coupon_code, session_id);

ALTER TABLE public.partner_link_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on partner_link_events"
  ON public.partner_link_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 2. Tabela de tokens públicos por cupom (link compartilhável com o parceiro)
CREATE TABLE public.partner_access_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_code TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMPTZ
);

CREATE INDEX idx_partner_access_tokens_coupon ON public.partner_access_tokens(coupon_code);
CREATE INDEX idx_partner_access_tokens_token ON public.partner_access_tokens(token);

ALTER TABLE public.partner_access_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on partner_access_tokens"
  ON public.partner_access_tokens
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 3. Função security definer para validar token e devolver cupom
CREATE OR REPLACE FUNCTION public.get_coupon_by_partner_token(_token TEXT)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon TEXT;
BEGIN
  SELECT coupon_code INTO v_coupon
  FROM public.partner_access_tokens
  WHERE token = _token AND active = true
  LIMIT 1;
  RETURN v_coupon;
END;
$$;