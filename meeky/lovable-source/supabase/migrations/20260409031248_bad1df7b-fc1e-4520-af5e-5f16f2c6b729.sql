CREATE UNIQUE INDEX IF NOT EXISTS orders_mp_payment_id_unique 
ON public.orders (mp_payment_id) 
WHERE mp_payment_id IS NOT NULL;