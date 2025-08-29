-- Create storage buckets for photo uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('expiry-photos', 'expiry-photos', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('fridge-photos', 'fridge-photos', false);

-- Create RLS policies for receipt photos
CREATE POLICY "Users can view their own receipt photos" ON storage.objects
FOR SELECT USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own receipt photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own receipt photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own receipt photos" ON storage.objects
FOR DELETE USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create RLS policies for expiry photos
CREATE POLICY "Users can view their own expiry photos" ON storage.objects
FOR SELECT USING (bucket_id = 'expiry-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own expiry photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'expiry-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own expiry photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'expiry-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own expiry photos" ON storage.objects
FOR DELETE USING (bucket_id = 'expiry-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create RLS policies for fridge photos
CREATE POLICY "Users can view their own fridge photos" ON storage.objects
FOR SELECT USING (bucket_id = 'fridge-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own fridge photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'fridge-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own fridge photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'fridge-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own fridge photos" ON storage.objects
FOR DELETE USING (bucket_id = 'fridge-photos' AND auth.uid()::text = (storage.foldername(name))[1]);