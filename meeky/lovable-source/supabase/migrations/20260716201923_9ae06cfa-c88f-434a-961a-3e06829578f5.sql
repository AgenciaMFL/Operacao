REVOKE EXECUTE ON FUNCTION public.reserve_coupon_use(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.release_coupon_use(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_coupon_use(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_coupon_use(text) TO service_role;