CREATE OR REPLACE FUNCTION public.get_delivered_orders_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::int FROM public.orders WHERE payment_status = 'approved';
$$;

REVOKE ALL ON FUNCTION public.get_delivered_orders_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_delivered_orders_count() TO anon, authenticated, service_role;