CREATE TABLE public.warranty_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  produto text NOT NULL DEFAULT 'Motion 1',
  nome text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  esporte text NOT NULL,
  canal_compra text NOT NULL,
  numero_serie text,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

GRANT INSERT ON public.warranty_leads TO anon, authenticated;
GRANT ALL ON public.warranty_leads TO service_role;

ALTER TABLE public.warranty_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit warranty activation"
ON public.warranty_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
