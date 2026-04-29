-- =============================================================================
-- Update restaurant card images with high-quality food photography
-- Run in Supabase Dashboard → SQL Editor
-- =============================================================================

-- Taylor's Soul Food — warm restaurant interior / soul food plating
UPDATE "Restaurant"
SET "imageUrl" = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80'
WHERE id = 'aa000000-0000-0000-0000-000000000005';

-- Dhan's Kitchen — Caribbean/Trinidadian curry platter
UPDATE "Restaurant"
SET "imageUrl" = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200&q=80'
WHERE name = 'Dhan''s Kitchen';

-- Verify
SELECT id, name, "imageUrl" FROM "Restaurant"
WHERE name IN ('Taylor''s Soul Food', 'Dhan''s Kitchen');
