-- Create products table for individual product tracking
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.product_categories(id),
  expiry_date DATE,
  purchase_date DATE DEFAULT CURRENT_DATE,
  image_path TEXT,
  barcode TEXT,
  brand TEXT,
  location TEXT, -- fridge, pantry, freezer, etc.
  quantity DECIMAL(10,2) DEFAULT 1,
  unit TEXT DEFAULT 'piece', -- piece, kg, liter, etc.
  notes TEXT,
  is_consumed BOOLEAN DEFAULT FALSE,
  consumed_at TIMESTAMP WITH TIME ZONE,
  raw_ocr_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products
CREATE POLICY "Users can view their own products"
ON public.products FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own products"
ON public.products FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
ON public.products FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
ON public.products FOR DELETE
USING (auth.uid() = user_id);

-- Create storage policies for product images
CREATE POLICY "Users can upload their own product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'fridge-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own product images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'fridge-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'fridge-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'fridge-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create trigger for automatic timestamp updates on products
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get expiring products
CREATE OR REPLACE FUNCTION public.get_expiring_products(days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
  id UUID,
  name TEXT,
  expiry_date DATE,
  days_until_expiry INTEGER,
  category_name TEXT,
  image_path TEXT,
  location TEXT
) 
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.name,
    p.expiry_date,
    (p.expiry_date - CURRENT_DATE)::INTEGER as days_until_expiry,
    pc.name as category_name,
    p.image_path,
    p.location
  FROM public.products p
  LEFT JOIN public.product_categories pc ON p.category_id = pc.id
  WHERE p.user_id = auth.uid()
    AND p.is_consumed = FALSE
    AND p.expiry_date IS NOT NULL
    AND p.expiry_date <= (CURRENT_DATE + days_ahead)
  ORDER BY p.expiry_date ASC;
$$;