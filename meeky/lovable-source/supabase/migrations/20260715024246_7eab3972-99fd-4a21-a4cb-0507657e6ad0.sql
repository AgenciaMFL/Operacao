
CREATE OR REPLACE FUNCTION public.abandoned_checkouts_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) IN ('anon', 'authenticated') THEN
    NEW.converted_order_id := OLD.converted_order_id;
    NEW.recovery_email_sent_at := OLD.recovery_email_sent_at;
    NEW.session_token := OLD.session_token;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.abandoned_checkouts_guard() FROM PUBLIC, anon, authenticated;
