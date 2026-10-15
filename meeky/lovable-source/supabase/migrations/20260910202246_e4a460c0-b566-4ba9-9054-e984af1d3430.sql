CREATE TABLE public.vip_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_key text NOT NULL UNIQUE,
  event_name text NOT NULL,
  event_dates text NOT NULL,
  event_location text NOT NULL,
  badge_emoji text NOT NULL DEFAULT '🎯',
  offer_product text NOT NULL DEFAULT 'Meeky F5 ANC Pro',
  offer_price_label text NOT NULL DEFAULT 'R$279 no evento',
  offer_extra text NOT NULL DEFAULT 'Frete grátis',
  social_cause text,
  instagram_handle text NOT NULL DEFAULT 'meeky.br',
  instagram_url text NOT NULL DEFAULT 'https://instagram.com/meeky.br',
  lead_source text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.vip_events TO anon, authenticated;
GRANT ALL ON public.vip_events TO service_role;

ALTER TABLE public.vip_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active vip events"
ON public.vip_events FOR SELECT
TO anon, authenticated
USING (active = true);

CREATE POLICY "Service role full access on vip_events"
ON public.vip_events FOR ALL
TO service_role
USING (true) WITH CHECK (true);

CREATE TABLE public.motion1_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  marketing_opt_in boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'home_bento',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.motion1_interest TO anon, authenticated;
GRANT ALL ON public.motion1_interest TO service_role;

ALTER TABLE public.motion1_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can register motion1 interest"
ON public.motion1_interest FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(name)) BETWEEN 2 AND 120
  AND length(btrim(email)) BETWEEN 5 AND 200
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(regexp_replace(whatsapp, '\D', '', 'g')) BETWEEN 10 AND 13
  AND marketing_opt_in = true
);

CREATE POLICY "Service role full access on motion1_interest"
ON public.motion1_interest FOR ALL
TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX idx_motion1_interest_created_at ON public.motion1_interest(created_at DESC);

CREATE OR REPLACE FUNCTION public.vip_events_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_vip_events_updated_at
BEFORE UPDATE ON public.vip_events
FOR EACH ROW EXECUTE FUNCTION public.vip_events_set_updated_at();

INSERT INTO public.vip_events (
  campaign_key, event_name, event_dates, event_location, badge_emoji,
  offer_product, offer_price_label, offer_extra, social_cause,
  instagram_handle, instagram_url, lead_source, active, is_default
) VALUES
(
  'crosstraining2026', 'Crosstraining Festival', '07/06', 'São José dos Campos', '🎯',
  'Meeky F5 ANC Pro', 'R$279 no evento', 'Frete grátis', '7% destinado ao IFP',
  'meeky.br', 'https://instagram.com/meeky.br', 'crosstraining_2026', true, false
),
(
  'racevalley2026', 'Race Valley', '12 e 13 de setembro de 2026', 'Shopping Vale Sul, São José dos Campos', '🏁',
  'Meeky F5 ANC Pro', 'R$279 no evento', 'Frete grátis', NULL,
  'meeky.br', 'https://instagram.com/meeky.br', 'racevalley_2026', true, true
);