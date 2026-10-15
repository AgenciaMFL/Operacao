
-- Remove public SELECT on analytics tables; keep INSERT for client tracking
DROP POLICY IF EXISTS "Public can read page_views" ON public.page_views;
DROP POLICY IF EXISTS "Public can read events" ON public.events;
DROP POLICY IF EXISTS "Public can read qr_scans" ON public.qr_scans;

-- Aggregated, sanitized stats for the public Crosstraining dashboard.
-- SECURITY DEFINER so anon can call it without direct SELECT on base tables.
CREATE OR REPLACE FUNCTION public.get_crosstraining_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_visits int;
  v_cta_clicks int;
  v_begin_checkout int;
  v_qr_stats jsonb;
BEGIN
  SELECT count(*) INTO v_visits
  FROM public.page_views WHERE page = 'crosstraining';

  SELECT count(*) FILTER (WHERE event_name = 'cta_click'),
         count(*) FILTER (WHERE event_name = 'begin_checkout')
    INTO v_cta_clicks, v_begin_checkout
  FROM public.events WHERE page = 'crosstraining';

  SELECT coalesce(jsonb_agg(jsonb_build_object(
           'qr_id', qr_id,
           'scans', scans,
           'conversions', conversions
         )), '[]'::jsonb)
    INTO v_qr_stats
  FROM (
    SELECT qr_id,
           count(*)::int AS scans,
           count(*) FILTER (WHERE converted)::int AS conversions
    FROM public.qr_scans
    GROUP BY qr_id
  ) s;

  RETURN jsonb_build_object(
    'visits', v_visits,
    'cta_clicks', v_cta_clicks,
    'begin_checkout', v_begin_checkout,
    'qr_stats', v_qr_stats
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_crosstraining_dashboard_stats() FROM public;
GRANT EXECUTE ON FUNCTION public.get_crosstraining_dashboard_stats() TO anon, authenticated;
