
CREATE OR REPLACE FUNCTION public.increment_partner_clicks(partner_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.partner_links
  SET clicks = clicks + 1
  WHERE slug = partner_slug;
END;
$$;
