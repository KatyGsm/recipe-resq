-- Update the get_expiring_products function to ensure accurate date comparisons
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
SET search_path = public
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
  ORDER BY p.expiry_date ASC, p.created_at DESC;
$$;