-- page_views
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  session_id text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_page_views_page_created ON public.page_views(page, created_at DESC);
CREATE INDEX idx_page_views_utm_campaign ON public.page_views(utm_campaign);
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert page_views"
ON public.page_views FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public can read page_views"
ON public.page_views FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Service role full access on page_views"
ON public.page_views FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  page text,
  session_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_name_created ON public.events(event_name, created_at DESC);
CREATE INDEX idx_events_utm_campaign ON public.events(utm_campaign);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert events"
ON public.events FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public can read events"
ON public.events FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Service role full access on events"
ON public.events FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- qr_scans
CREATE TABLE public.qr_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_id text NOT NULL,
  location text NOT NULL,
  session_id text,
  converted boolean NOT NULL DEFAULT false,
  scanned_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_qr_scans_qr_id ON public.qr_scans(qr_id);
CREATE INDEX idx_qr_scans_scanned_at ON public.qr_scans(scanned_at DESC);
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert qr_scans"
ON public.qr_scans FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public can read qr_scans"
ON public.qr_scans FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Service role full access on qr_scans"
ON public.qr_scans FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');