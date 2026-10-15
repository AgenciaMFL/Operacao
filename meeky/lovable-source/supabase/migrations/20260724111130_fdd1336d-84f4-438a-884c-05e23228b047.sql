ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stock_released_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS coupon_released_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.expire_pending_pix_orders()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  r RECORD;
  n INTEGER := 0;
BEGIN
  FOR r IN
    UPDATE public.orders
       SET payment_status = 'expired'
     WHERE payment_status = 'pending'
       AND created_at < now() - interval '35 minutes'
    RETURNING id, sku, quantity, coupon_code, stock_released_at, coupon_released_at
  LOOP
    n := n + 1;
    IF r.sku IS NOT NULL AND r.quantity IS NOT NULL AND r.quantity > 0 AND r.stock_released_at IS NULL THEN
      BEGIN
        PERFORM public.release_stock(r.sku, r.quantity);
        UPDATE public.orders SET stock_released_at = now() WHERE id = r.id;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'expire_pending_pix_orders: release_stock failed for order %: %', r.id, SQLERRM;
      END;
    END IF;
    IF r.coupon_code IS NOT NULL AND length(r.coupon_code) > 0 AND r.coupon_released_at IS NULL THEN
      BEGIN
        PERFORM public.release_coupon_use(r.coupon_code);
        UPDATE public.orders SET coupon_released_at = now() WHERE id = r.id;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'expire_pending_pix_orders: release_coupon_use failed for order %: %', r.id, SQLERRM;
      END;
    END IF;
  END LOOP;
  RETURN n;
END;
$function$;