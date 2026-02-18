-- Seed Mock Restaurants with UUIDs

-- 1. Carolina BBQ Pit
INSERT INTO "Restaurant" (id, name, address, description, lat, lng, "imageUrl", "openTime", "closeTime", "visibility", "isMock", city, state)
VALUES 
(
    '00000000-0000-0000-0000-000000000001', 
    'Carolina BBQ Pit (Mock)', 
    '123 BBQ Lane, Charlotte, NC', 
    'Best BBQ in Charlotte, serving slow-smoked ribs and pulled pork since 1985.', 
    35.2271, -80.8431, 
    '/restaurant1.jpg', 
    '06:00:00', '23:59:00', 
    'VISIBLE', true,
    'Charlotte', 'NC'
)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    "imageUrl" = EXCLUDED."imageUrl",
    "visibility" = 'VISIBLE';

-- 2. Queen City Burger
INSERT INTO "Restaurant" (id, name, address, description, lat, lng, "imageUrl", "openTime", "closeTime", "visibility", "isMock", city, state)
VALUES 
(
    '00000000-0000-0000-0000-000000000002', 
    'Queen City Burger (Mock)', 
    '456 Burger Ave, Charlotte, NC', 
    'Gourmet burgers made with locally sourced beef.', 
    35.2280, -80.8440, 
    '/restaurant2.jpg', 
    '06:00:00', '23:59:00', 
    'VISIBLE', true,
    'Charlotte', 'NC'
)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    "imageUrl" = EXCLUDED."imageUrl",
    "visibility" = 'VISIBLE';

-- 3. North Star Diner
INSERT INTO "Restaurant" (id, name, address, description, lat, lng, "imageUrl", "openTime", "closeTime", "visibility", "isMock", city, state)
VALUES 
(
    '00000000-0000-0000-0000-000000000003', 
    'North Star Diner (Mock)', 
    '789 Diner Rd, Ramsey, MN', 
    'Hearty Minnesota breakfast served all day.', 
    45.2611, -93.4566, 
    '/restaurant3.jpg', 
    '06:00:00', '23:59:00', 
    'VISIBLE', true,
    'Ramsey', 'MN'
)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    "imageUrl" = EXCLUDED."imageUrl",
    "visibility" = 'VISIBLE';

-- 4. Old Town Kitchen
INSERT INTO "Restaurant" (id, name, address, description, lat, lng, "imageUrl", "openTime", "closeTime", "visibility", "isMock", city, state)
VALUES 
(
    '00000000-0000-0000-0000-000000000004', 
    'Old Town Kitchen (Mock)', 
    '101 Southern Way, Rock Hill, SC', 
    'Authentic Southern comfort food.', 
    34.9249, -81.0251, 
    '/restaurant3.jpg', 
    '06:00:00', '23:59:00', 
    'VISIBLE', true,
    'Rock Hill', 'SC'
)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    "imageUrl" = EXCLUDED."imageUrl",
    "visibility" = 'VISIBLE';

-- 5. Pineville Pizzeria
INSERT INTO "Restaurant" (id, name, address, description, lat, lng, "imageUrl", "openTime", "closeTime", "visibility", "isMock", city, state)
VALUES 
(
    '00000000-0000-0000-0000-000000000005', 
    'Pineville Pizzeria (Mock)', 
    '202 Pizza Cir, Pineville, NC', 
    'New York style pizza in Pineville.', 
    35.0833, -80.8872, 
    '/restaurant2.jpg', 
    '06:00:00', '23:59:00', 
    'VISIBLE', true,
    'Pineville', 'NC'
)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    "imageUrl" = EXCLUDED."imageUrl",
    "visibility" = 'VISIBLE';


-- Menu Items
INSERT INTO "MenuItem" (id, "restaurantId", name, description, price, "imageUrl", status, inventory)
VALUES
('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000001', 'Pulled Pork Plate', 'Slow-smoked pork shoulder with two sides', 14.99, '/hero-pizza.png', 'APPROVED', 100),
('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-000000000001', 'Half-Rack Ribs', 'St. Louis style ribs with house sauce', 18.50, NULL, 'APPROVED', 30),
('00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-000000000001', 'Cornbread', 'Fresh baked daily', 3.50, NULL, 'APPROVED', 200),
('00000000-0000-0000-0000-0000000000a4', '00000000-0000-0000-0000-000000000002', 'The Queen Burger', 'Double patty, sharp cheddar, bacon jam', 16.99, '/hero-burger.png', 'APPROVED', 50),
('00000000-0000-0000-0000-0000000000a5', '00000000-0000-0000-0000-000000000002', 'Truffle Fries', 'Hand-cut fries with truffle oil and parmesan', 6.50, NULL, 'APPROVED', 50),
('00000000-0000-0000-0000-0000000000a6', '00000000-0000-0000-0000-000000000003', 'Pancakes Stack', 'Three fluffy buttermilk pancakes', 10.99, NULL, 'APPROVED', 100),
('00000000-0000-0000-0000-0000000000a7', '00000000-0000-0000-0000-000000000003', 'Lumberjack Breakfast', 'Eggs, bacon, sausage, hashbrowns, toast', 14.99, NULL, 'APPROVED', 50),
('00000000-0000-0000-0000-0000000000a8', '00000000-0000-0000-0000-000000000004', 'Fried Chicken', 'Crispy golden fried chicken with mashed potatoes', 15.99, NULL, 'APPROVED', 40),
('00000000-0000-0000-0000-0000000000a9', '00000000-0000-0000-0000-000000000004', 'Shrimp & Grits', 'Lowcountry classic with andouille sausage', 17.99, NULL, 'APPROVED', 30),
('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-000000000005', 'Cheese Pizza (Large)', '18-inch classic cheese pizza', 18.99, NULL, 'APPROVED', 50),
('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-000000000005', 'Pepperoni Slice', 'Jumbo slice with pepperoni', 4.50, NULL, 'APPROVED', 100)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    inventory = EXCLUDED.inventory;
