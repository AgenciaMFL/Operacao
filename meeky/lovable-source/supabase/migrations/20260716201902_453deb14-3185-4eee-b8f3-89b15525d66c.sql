CREATE OR REPLACE FUNCTION public.reserve_coupon_use(_code text)
RETURNS TABLE(code text, discount_type text, discount_value numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.coupons AS c
  SET uses_count = c.uses_count + 1
  WHERE c.code = _code
    AND c.active = true
    AND (c.expires_at IS NULL OR c.expires_at > now())
    AND (c.max_uses IS NULL OR c.uses_count < c.max_uses)
  RETURNING c.code, c.discount_type, c.discount_value;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_coupon_use(_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons
  SET uses_count = GREATEST(uses_count - 1, 0)
  WHERE code = _code;
END;
$$;