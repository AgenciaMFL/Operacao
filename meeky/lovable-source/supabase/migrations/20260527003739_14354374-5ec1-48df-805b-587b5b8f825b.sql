CREATE TABLE public.vip_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'crosstraining_2026',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.vip_leads TO anon, authenticated;
GRANT ALL ON public.vip_leads TO service_role;

ALTER TABLE public.vip_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert vip_leads"
ON public.vip_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  name IS NOT NULL AND length(name) BETWEEN 1 AND 200
  AND whatsapp IS NOT NULL AND length(whatsapp) BETWEEN 10 AND 30
  AND email IS NOT NULL AND length(email) BETWEEN 3 AND 255
);

CREATE POLICY "Service role full access on vip_leads"
ON public.vip_leads
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE INDEX idx_vip_leads_created_at ON public.vip_leads(created_at DESC);