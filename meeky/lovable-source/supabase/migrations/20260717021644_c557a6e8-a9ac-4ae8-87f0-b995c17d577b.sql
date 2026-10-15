REVOKE ALL ON FUNCTION public.expire_pending_pix_orders() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_pending_pix_orders() TO postgres, service_role;