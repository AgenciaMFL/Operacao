
CREATE OR REPLACE FUNCTION public.reserve_stock(_sku text, _qty int)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _remaining int;
BEGIN
  UPDATE public.product_stock
  SET stock_quantity = stock_quantity - _qty,
      in_stock = CASE WHEN stock_quantity - _qty <= 0 THEN false ELSE true END,
      updated_at = now()
  WHERE sku = _sku
    AND stock_quantity >= _qty
    AND in_stock = true
  RETURNING stock_quantity INTO _remaining;
  RETURN _remaining;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_stock(_sku text, _qty int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.product_stock
  SET stock_quantity = stock_quantity + _qty,
      in_stock = true,
      updated_at = now()
  WHERE sku = _sku;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_stock(text, int) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_stock(text, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_stock(text, int) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_stock(text, int) TO service_role;
