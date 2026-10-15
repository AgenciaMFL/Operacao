-- Expira pedidos pendentes antigos (Pix não pago) de forma atômica.
-- O UPDATE ... RETURNING garante que um webhook concorrente que aprove o
-- pagamento não vai perder para o cron: quem chegar primeiro no UPDATE
-- "vence" a linha; se o webhook aprovar antes, o WHERE payment_status='pending'
-- deixa de casar e o cron não expira nada.
CREATE OR REPLACE FUNCTION public.expire_pending_pix_orders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  n INTEGER := 0;
BEGIN
  FOR r IN
    UPDATE public.orders
       SET payment_status = 'expired'
     WHERE payment_status = 'pending'
       AND created_at < now() - interval '35 minutes'
    RETURNING id, sku, quantity, coupon_code
  LOOP
    n := n + 1;
    IF r.sku IS NOT NULL AND r.quantity IS NOT NULL AND r.quantity > 0 THEN
      BEGIN
        PERFORM public.release_stock(r.sku, r.quantity);
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'expire_pending_pix_orders: release_stock failed for order %: %', r.id, SQLERRM;
      END;
    END IF;
    IF r.coupon_code IS NOT NULL AND length(r.coupon_code) > 0 THEN
      BEGIN
        PERFORM public.release_coupon_use(r.coupon_code);
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'expire_pending_pix_orders: release_coupon_use failed for order %: %', r.id, SQLERRM;
      END;
    END IF;
  END LOOP;
  RETURN n;
END;
$$;

-- (Re)agenda o cron a cada 5 minutos.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-pending-pix-orders') THEN
    PERFORM cron.unschedule('expire-pending-pix-orders');
  END IF;
  PERFORM cron.schedule(
    'expire-pending-pix-orders',
    '*/5 * * * *',
    $cron$ SELECT public.expire_pending_pix_orders(); $cron$
  );
END $$;