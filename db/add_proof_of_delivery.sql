-- Run this in your Supabase SQL Editor to enable Photo Proof of Delivery

-- 1. Add the column to store the Supabase Storage URL
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "proofOfDeliveryUrl" TEXT;
COMMENT ON COLUMN "Order"."proofOfDeliveryUrl" IS 'URL to the photo proof of delivery';

-- 2. Create the Storage Bucket for the photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('delivery_proofs', 'delivery_proofs', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Security Policies for the Bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'delivery_proofs' );

CREATE POLICY "Authenticated users can upload delivery proofs" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK ( bucket_id = 'delivery_proofs' );
