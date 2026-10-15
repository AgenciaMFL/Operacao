
CREATE TABLE public.product_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text NOT NULL UNIQUE,
  in_stock boolean NOT NULL DEFAULT true,
  stock_quantity integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.product_stock
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow service role full access" ON public.product_stock
  FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.product_stock (sku, in_stock, stock_quantity) VALUES ('f5anc', true, 100);
