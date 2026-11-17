-- Additive migration: existing school records are intentionally preserved.
-- Only explicitly assigned administrators can manage the catalogue.
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE CHECK (length(trim(name)) BETWEEN 1 AND 100)
);
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
  slug text NOT NULL UNIQUE,
  sku text UNIQUE,
  description text NOT NULL DEFAULT '',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  price numeric(12,2) CHECK (price >= 0),
  currency text NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  image_url text NOT NULL DEFAULT '',
  specifications jsonb NOT NULL DEFAULT '{}',
  stock_status text NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock','low_stock','out_of_stock')),
  published boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 150),
  email text NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
  phone text NOT NULL DEFAULT '' CHECK (length(phone) <= 50),
  service text NOT NULL DEFAULT '' CHECK (length(service) <= 100),
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  message text NOT NULL CHECK (length(trim(message)) BETWEEN 1 AND 5000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','quoted','resolved')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON public.products(category_id);
CREATE INDEX products_published_idx ON public.products(published, created_at DESC);
CREATE INDEX inquiries_created_idx ON public.inquiries(created_at DESC);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
-- Override Supabase's possible default table grants before granting narrowly.
REVOKE ALL ON public.categories, public.products, public.inquiries FROM anon, authenticated;
GRANT SELECT ON public.categories, public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories, public.products TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.inquiries TO authenticated;
-- Anonymous users can submit but cannot read or change requests.
GRANT INSERT (name,email,phone,service,product_id,message) ON public.inquiries TO anon, authenticated;
CREATE POLICY "Public categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Public published products" ON public.products FOR SELECT USING (published);
CREATE POLICY "Admin products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Submit inquiry" ON public.inquiries FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new' AND (product_id IS NULL OR EXISTS (
    SELECT 1 FROM public.products WHERE id = product_id AND published
  )));
CREATE POLICY "Admin read inquiries" ON public.inquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin update inquiries" ON public.inquiries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin delete inquiries" ON public.inquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE FUNCTION public.touch_product_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER product_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_product_updated_at();
INSERT INTO public.categories(name) VALUES
 ('Laptops & Desktops'), ('Networking'), ('Storage & Memory'), ('Printers'), ('CCTV & Security'), ('Accessories');

INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('product-images','product-images',true,5242880,ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin upload product images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin delete product images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
