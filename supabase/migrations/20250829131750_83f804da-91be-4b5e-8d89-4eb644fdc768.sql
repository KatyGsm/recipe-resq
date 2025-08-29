-- Create product categories table
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create receipts table
CREATE TABLE public.receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  store_name TEXT,
  receipt_date DATE,
  total_amount DECIMAL(10,2),
  image_path TEXT,
  raw_text TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create receipt_items table
CREATE TABLE public.receipt_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  product_category_id UUID REFERENCES public.product_categories(id),
  raw_product_name TEXT NOT NULL,
  standardized_name TEXT,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for receipts
CREATE POLICY "Users can view their own receipts"
ON public.receipts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own receipts"
ON public.receipts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receipts"
ON public.receipts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receipts"
ON public.receipts FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for receipt_items
CREATE POLICY "Users can view items from their receipts"
ON public.receipt_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.receipts 
  WHERE receipts.id = receipt_items.receipt_id 
  AND receipts.user_id = auth.uid()
));

CREATE POLICY "Users can create items for their receipts"
ON public.receipt_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.receipts 
  WHERE receipts.id = receipt_items.receipt_id 
  AND receipts.user_id = auth.uid()
));

CREATE POLICY "Users can update items from their receipts"
ON public.receipt_items FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.receipts 
  WHERE receipts.id = receipt_items.receipt_id 
  AND receipts.user_id = auth.uid()
));

CREATE POLICY "Users can delete items from their receipts"
ON public.receipt_items FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.receipts 
  WHERE receipts.id = receipt_items.receipt_id 
  AND receipts.user_id = auth.uid()
));

-- Product categories are viewable by everyone but only insertable by authenticated users
CREATE POLICY "Everyone can view product categories"
ON public.product_categories FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create product categories"
ON public.product_categories FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create storage policies for receipt images
CREATE POLICY "Users can upload their own receipt images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own receipt images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own receipt images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'receipts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own receipt images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'receipts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Insert common product categories
INSERT INTO public.product_categories (name, description) VALUES
('Dairy', 'Milk, cheese, yogurt, butter and other dairy products'),
('Meat & Poultry', 'Fresh and processed meat, chicken, fish'),
('Fruits & Vegetables', 'Fresh produce, fruits and vegetables'),
('Bakery', 'Bread, pastries, baked goods'),
('Beverages', 'Soft drinks, juices, water, alcohol'),
('Snacks & Sweets', 'Chips, cookies, candy, chocolate'),
('Pantry Staples', 'Rice, pasta, flour, oils, spices'),
('Frozen Foods', 'Frozen meals, ice cream, frozen vegetables'),
('Personal Care', 'Toiletries, cosmetics, hygiene products'),
('Household', 'Cleaning supplies, paper products, batteries'),
('Other', 'Miscellaneous items not fitting other categories');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on receipts
CREATE TRIGGER update_receipts_updated_at
BEFORE UPDATE ON public.receipts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();