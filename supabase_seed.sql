-- 1. Create Users
-- Admin
INSERT INTO "User" ("id", "email", "name", "role", "isMember", "balance", "updatedAt")
VALUES ('user_admin', 'admin@trueserve.com', 'Admin User', 'ADMIN', false, 0, NOW())
ON CONFLICT ("email") DO NOTHING;

-- Merchant (Charlotte)
INSERT INTO "User" ("id", "email", "name", "role", "isMember", "balance", "updatedAt")
VALUES ('user_merchant_clt', 'mario@italianplace.com', 'Mario Rossi', 'MERCHANT', false, 0, NOW())
ON CONFLICT ("email") DO NOTHING;

-- Merchant (Ramsey)
INSERT INTO "User" ("id", "email", "name", "role", "isMember", "balance", "updatedAt")
VALUES ('user_merchant_mn', 'ramsey.owner@trueserve.com', 'Ramsey Owner', 'MERCHANT', false, 0, NOW())
ON CONFLICT ("email") DO NOTHING;

-- 2. Create Service Locations (The ones you requested!)
INSERT INTO "ServiceLocation" ("id", "city", "state", "zipPrefixes", "isActive", "updatedAt")
VALUES 
('loc_clt', 'Charlotte', 'NC', ARRAY['282', '280', '281'], true, NOW()),
('loc_ramsey', 'Ramsey', 'MN', ARRAY['553', '550'], true, NOW())
ON CONFLICT DO NOTHING;

-- 3. Create Restaurants
-- Charlotte: Carolina BBQ Pit
INSERT INTO "Restaurant" ("id", "name", "description", "address", "city", "state", "lat", "lng", "imageUrl", "ownerId", "avgPrepTime", "updatedAt")
VALUES ('rest_bbq', 'Carolina BBQ Pit', 'Slow-cooked pulled pork and ribs.', '200 S Tryon St, Charlotte, NC 28202', 'Charlotte', 'NC', 35.2271, -80.8431, '/restaurant1.jpg', 'user_merchant_clt', 15, NOW())
ON CONFLICT DO NOTHING;

-- Charlotte: Queen City Burger
INSERT INTO "Restaurant" ("id", "name", "description", "address", "city", "state", "lat", "lng", "imageUrl", "ownerId", "avgPrepTime", "updatedAt")
VALUES ('rest_burger', 'Queen City Burger', 'Gourmet burgers and shakes.', '100 N Tryon St, Charlotte, NC 28202', 'Charlotte', 'NC', 35.2280, -80.8440, '/restaurant2.jpg', 'user_admin', 15, NOW())
ON CONFLICT DO NOTHING;

-- Ramsey: North Star Diner
INSERT INTO "Restaurant" ("id", "name", "description", "address", "city", "state", "lat", "lng", "imageUrl", "ownerId", "avgPrepTime", "updatedAt")
VALUES ('rest_diner', 'North Star Diner', 'Comfort food and hearty breakfasts.', '14200 St Francis Blvd, Ramsey, MN 55303', 'Ramsey', 'MN', 45.2611, -93.4566, '/restaurant3.jpg', 'user_merchant_mn', 15, NOW())
ON CONFLICT DO NOTHING;

-- 4. Create Menu Items
-- BBQ items
INSERT INTO "MenuItem" ("id", "name", "description", "price", "imageUrl", "status", "restaurantId", "updatedAt")
VALUES 
('item_pork', 'Pulled Pork Platter', 'With carolina gold sauce.', 16.99, '/pork.jpg', 'APPROVED', 'rest_bbq', NOW()),
('item_ribs', 'Ribs Half Rack', 'Fall off the bone ribs.', 22.50, '/ribs.jpg', 'APPROVED', 'rest_bbq', NOW())
ON CONFLICT DO NOTHING;

-- Burger items
INSERT INTO "MenuItem" ("id", "name", "description", "price", "imageUrl", "status", "restaurantId", "updatedAt")
VALUES 
('item_smash', 'Classic Smash', 'Double patty, cheese, onions.', 12.99, '/burger.jpg', 'APPROVED', 'rest_burger', NOW())
ON CONFLICT DO NOTHING;

-- Diner items
INSERT INTO "MenuItem" ("id", "name", "description", "price", "imageUrl", "status", "restaurantId", "updatedAt")
VALUES 
('item_bfast', 'Lumberjack Breakfast', 'Eggs, pancakes, bacon, sausage.', 15.99, '/breakfast.jpg', 'APPROVED', 'rest_diner', NOW()),
('item_walleye', 'Walleye Sandwich', 'Fresh caught walleye on a bun.', 18.50, '/walleye.jpg', 'APPROVED', 'rest_diner', NOW())
ON CONFLICT DO NOTHING;
