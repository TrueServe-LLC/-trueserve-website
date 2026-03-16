-- Add inventory management fields
ALTER TABLE "MenuItem" 
ADD COLUMN IF NOT EXISTS "ingredients" TEXT[] DEFAULT '{}';

ALTER TABLE "Restaurant" 
ADD COLUMN IF NOT EXISTS "outOfStockIngredients" TEXT[] DEFAULT '{}';

COMMENT ON COLUMN "MenuItem"."ingredients" IS 'List of key ingredients to enable smart inventory dependencies';
COMMENT ON COLUMN "Restaurant"."outOfStockIngredients" IS 'Ingredients currently unavailable, used to automatically pause linked menu items';
