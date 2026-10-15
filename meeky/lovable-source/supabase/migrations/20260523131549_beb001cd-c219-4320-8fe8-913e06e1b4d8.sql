
-- Revoke from PUBLIC (default grant) so anon/authenticated truly lose access
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_coupon_by_partner_token(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_partner_clicks(text) FROM PUBLIC;

-- Tighten public-insert tracking policies: require basic shape rather than WITH CHECK true.
-- These tables must remain anon-insertable for client-side analytics, but constrain payloads.

DROP POLICY IF EXISTS "Public can insert page_views" ON public.page_views;
CREATE POLICY "Public can insert page_views"
  ON public.page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (page IS NOT NULL AND length(page) <= 200);

DROP POLICY IF EXISTS "Public can insert events" ON public.events;
CREATE POLICY "Public can insert events"
  ON public.events FOR INSERT
  TO anon, authenticated
  WITH CHECK (event_name IS NOT NULL AND length(event_name) <= 100);

DROP POLICY IF EXISTS "Public can insert qr_scans" ON public.qr_scans;
CREATE POLICY "Public can insert qr_scans"
  ON public.qr_scans FOR INSERT
  TO anon, authenticated
  WITH CHECK (qr_id IS NOT NULL AND length(qr_id) <= 100);
