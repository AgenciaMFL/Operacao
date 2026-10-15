
CREATE TABLE public.partner_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  coupon_code TEXT NOT NULL,
  utm_source TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.partner_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read partner links"
ON public.partner_links
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Service role full access on partner_links"
ON public.partner_links
FOR ALL
TO public
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);
