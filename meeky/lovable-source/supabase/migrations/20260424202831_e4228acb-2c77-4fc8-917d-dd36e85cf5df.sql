DELETE FROM public.orders WHERE coupon_code = 'TESTE';
DELETE FROM public.partner_payments WHERE coupon_id IN (SELECT id FROM public.coupons WHERE code = 'TESTE');
DELETE FROM public.partner_link_events WHERE coupon_code = 'TESTE';
DELETE FROM public.partner_links WHERE coupon_code = 'TESTE';
DELETE FROM public.partner_access_tokens WHERE coupon_code = 'TESTE';
UPDATE public.coupons SET uses_count = 0 WHERE code = 'TESTE';