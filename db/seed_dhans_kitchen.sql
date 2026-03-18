-- Seed Dhan's Kitchen
-- 1. Create Merchant User
INSERT INTO "User" (id, name, email, phone, role, address, "createdAt", "updatedAt")
VALUES (
    'd8a2f1b4-2d5d-4b3c-9e2c-1a2b3c4d5e6f',
    'Dhan Griffin',
    'dhanskitchen@trueserve.test',
    '+19102638591',
    'MERCHANT',
    '432 Chatham St, Fayetteville, NC 28301',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Create Restaurant
INSERT INTO "Restaurant" (id, name, address, description, lat, lng, "imageUrl", "openTime", "closeTime", "visibility", "isMock", city, state, "merchantId")
VALUES (
    'dhans-kitchen-uuid',
    'Dhan''s Kitchen',
    '432 Chatham St, Fayetteville, NC 28301',
    'Authentic Caribbean Flavor from the Islands. Made with Love. Specializing in Trinidadian street food, doubles, and hearty curry platters.',
    35.0503,
    -78.8781,
    'https://images.unsplash.com/photo-1599307767316-776533da941c?q=80&w=2000&auto=format&fit=crop',
    '11:00:00',
    '20:00:00',
    'VISIBLE',
    false,
    'Fayetteville',
    'NC',
    'd8a2f1b4-2d5d-4b3c-9e2c-1a2b3c4d5e6f'
) ON CONFLICT (id) DO UPDATE SET
    address = EXCLUDED.address,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng;

-- 3. Menu Items
INSERT INTO "MenuItem" (id, "restaurantId", name, description, price, status, inventory)
VALUES
-- Combo Meals
('dk-item-01', 'dhans-kitchen-uuid', 'Veggie Combo', 'All combos served with choice of Rice & Beans, White Rice, or Roti. Includes two sides: Curry Potato, Curry Channa, Seasoned Cabbage, or Fried Sweet Plantains.', 13.99, 'APPROVED', 100),
('dk-item-02', 'dhans-kitchen-uuid', 'Curry Chicken Combo', 'Authentic curry chicken with your choice of sides.', 15.99, 'APPROVED', 100),
('dk-item-03', 'dhans-kitchen-uuid', 'Brown Stew Chicken Combo', 'Slow-cooked stew chicken in a rich brown gravy.', 15.99, 'APPROVED', 100),
('dk-item-04', 'dhans-kitchen-uuid', 'Jerk Chicken Combo', 'Spicy, grilled jerk chicken with island spices.', 15.99, 'APPROVED', 100),
('dk-item-05', 'dhans-kitchen-uuid', 'Jerk Ribs Combo', 'Tender pork ribs with smoky jerk seasoning.', 18.99, 'APPROVED', 100),
('dk-item-06', 'dhans-kitchen-uuid', 'Curry Shrimp Combo', 'Savory shrimp in a rich curry sauce.', 18.99, 'APPROVED', 100),
('dk-item-07', 'dhans-kitchen-uuid', 'Stewed Oxtails Combo', 'Rich, fall-off-the-bone stewed oxtails.', 19.99, 'APPROVED', 100),
('dk-item-08', 'dhans-kitchen-uuid', 'Curry Goat Combo', 'Tender goat meat slow-cooked in traditional curry.', 21.99, 'APPROVED', 100),
('dk-item-09', 'dhans-kitchen-uuid', 'Mrs. Griffin "All veggie" Sampler', 'A massive sampler of all our vegan and veggie favorites.', 22.99, 'APPROVED', 50),
('dk-item-10', 'dhans-kitchen-uuid', 'Mr. Griffin "All meats" Sampler', 'The ultimate carnivore sampler with all our signature meats.', 26.99, 'APPROVED', 50),

-- Non-Vegan Items
('dk-item-11', 'dhans-kitchen-uuid', 'Doubles with Chicken', 'Trinidadian doubles topped with curried chicken.', 4.99, 'APPROVED', 100),
('dk-item-12', 'dhans-kitchen-uuid', 'Bake & Saltfish', 'Fried dough served with savory saltfish.', 10.99, 'APPROVED', 100),
('dk-item-13', 'dhans-kitchen-uuid', 'Macaroni Pie', 'Baked cheesy macaroni, a Caribbean staple.', 4.50, 'APPROVED', 100),

-- Vegan Items
('dk-item-14', 'dhans-kitchen-uuid', 'Doubles (Vegan)', 'Traditional curried chickpeas between two fried flatbreads.', 3.50, 'APPROVED', 200),
('dk-item-15', 'dhans-kitchen-uuid', 'Dhalpuri Roti', 'Single dhalpuri roti skin.', 5.00, 'APPROVED', 100),
('dk-item-16', 'dhans-kitchen-uuid', 'Buss-Up-Shot Roti', 'Single paratha roti skin.', 5.00, 'APPROVED', 100),
('dk-item-17', 'dhans-kitchen-uuid', 'Fried Sweet Plantains', 'Perfectly ripened, sweet fried plantains.', 3.99, 'APPROVED', 100),
('dk-item-18', 'dhans-kitchen-uuid', 'Curry Mango', 'Spicy and sweet curried green mango.', 5.99, 'APPROVED', 100),

-- Sweets
('dk-item-19', 'dhans-kitchen-uuid', 'Currants Roll', 'Sweet pastry filled with currants.', 3.99, 'APPROVED', 50),
('dk-item-20', 'dhans-kitchen-uuid', 'Cassava Pone', 'Dense, sweet cassava cake.', 4.50, 'APPROVED', 50),

-- Beverages
('dk-item-21', 'dhans-kitchen-uuid', 'Sorrel', 'Traditional hibiscus-based beverage.', 4.50, 'APPROVED', 100),
('dk-item-22', 'dhans-kitchen-uuid', 'Peanut Punch', 'Creamy, nutty Caribbean punch.', 4.50, 'APPROVED', 100),
('dk-item-23', 'dhans-kitchen-uuid', 'Shandy Carib', 'Light beer shandy in various flavors.', 3.99, 'APPROVED', 100)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    inventory = EXCLUDED.inventory;
