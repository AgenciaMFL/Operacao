DROP POLICY IF EXISTS "Anyone can submit warranty activation" ON public.warranty_leads;

CREATE POLICY "Anyone can submit warranty activation"
ON public.warranty_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  nome IS NOT NULL
  AND char_length(nome) BETWEEN 1 AND 120
  AND email IS NOT NULL
  AND char_length(email) BETWEEN 5 AND 254
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND whatsapp IS NOT NULL
  AND char_length(whatsapp) BETWEEN 8 AND 32
  AND esporte IS NOT NULL
  AND char_length(esporte) BETWEEN 1 AND 40
  AND canal_compra IS NOT NULL
  AND char_length(canal_compra) BETWEEN 1 AND 40
  AND (numero_serie IS NULL OR char_length(numero_serie) <= 80)
  AND (utm_source IS NULL OR char_length(utm_source) <= 100)
  AND (utm_medium IS NULL OR char_length(utm_medium) <= 100)
  AND (utm_campaign IS NULL OR char_length(utm_campaign) <= 100)
  AND char_length(produto) BETWEEN 1 AND 80
);
