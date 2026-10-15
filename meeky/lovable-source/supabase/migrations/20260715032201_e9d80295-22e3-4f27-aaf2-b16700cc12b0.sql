-- Lock down abandoned_checkouts writes: only service_role (edge functions) can insert/update.
DROP POLICY IF EXISTS "Anyone can insert an abandoned checkout draft" ON public.abandoned_checkouts;
DROP POLICY IF EXISTS "Anyone can update their own abandoned checkout" ON public.abandoned_checkouts;

REVOKE INSERT, UPDATE ON public.abandoned_checkouts FROM anon;
REVOKE INSERT, UPDATE ON public.abandoned_checkouts FROM authenticated;