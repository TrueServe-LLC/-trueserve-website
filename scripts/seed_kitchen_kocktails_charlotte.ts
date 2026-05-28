import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const RESTAURANT = {
  name: "Kitchen + Kocktails Charlotte",
  contactName: "Kitchen + Kocktails Charlotte Team",
  email: "kitchenkocktails.charlotte@trueserve.delivery",
  password: "KitchenKocktails2026!",
  phone: "+1.980.372.7333",
  street: "210 E Trade St",
  city: "Charlotte",
  state: "NC",
  zip: "28202",
  cuisineType: "Southern Comfort",
  description:
    "Southern comfort restaurant experience in Uptown Charlotte featuring fried chicken, seafood, waffles, and chef-driven comfort dishes.",
  imageUrl: "/merchant_hero.png",
  openTime: "11:00:00",
  closeTime: "23:59:00",
  lat: 35.22512,
  lng: -80.84308,
};

const MENU = [
  {
    category: "Favorites",
    name: "Fried Chicken",
    description: "Crispy Southern-style chicken with a comfort-food finish.",
    price: 24,
  },
  {
    category: "Favorites",
    name: "Lobster & Waffles",
    description: "Sweet waffles paired with lobster for a signature brunch-style plate.",
    price: 42,
  },
  {
    category: "Favorites",
    name: "Shrimp & Grits",
    description: "Creamy grits topped with seasoned shrimp and Southern aromatics.",
    price: 28,
  },
  {
    category: "Favorites",
    name: "Caribbean Jerk Lamb Chops",
    description: "Tender lamb chops with warm jerk spices and a rich plate presentation.",
    price: 48,
  },
  {
    category: "Entrees",
    name: "Blackened Shrimp over Dirty Rice",
    description: "Blackened shrimp served over savory seasoned rice.",
    price: 29,
  },
  {
    category: "Entrees",
    name: "Southern Fried Catfish over Spaghetti",
    description: "Fried catfish served with a hearty Southern-inspired spaghetti plate.",
    price: 27,
  },
  {
    category: "Entrees",
    name: "Fried Chicken with Red Beans & Rice",
    description: "Crispy chicken served with red beans and rice.",
    price: 26,
  },
  {
    category: "Starters",
    name: "Appetizer Trio",
    description: "A shareable starter sampler for the table.",
    price: 24,
  },
  {
    category: "Sides",
    name: "Mac & Cheese",
    description: "Creamy baked macaroni and cheese.",
    price: 9,
  },
  {
    category: "Sides",
    name: "Collard Greens",
    description: "Slow-cooked greens with classic Southern seasoning.",
    price: 8,
  },
  {
    category: "Sides",
    name: "Red Beans & Rice",
    description: "Savory red beans served with seasoned rice.",
    price: 8,
  },
  {
    category: "Desserts",
    name: "Chocolate Cake",
    description: "Rich chocolate cake slice.",
    price: 12,
  },
  {
    category: "Desserts",
    name: "Carrot Cake",
    description: "Classic carrot cake slice.",
    price: 12,
  },
];

async function getOrCreateAuthUser() {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: RESTAURANT.email,
    password: RESTAURANT.password,
    email_confirm: true,
    user_metadata: {
      displayName: RESTAURANT.contactName,
      role: "MERCHANT",
    },
  });

  if (created?.user) {
    return { userId: created.user.id, authCreated: true };
  }

  const alreadyExists =
    createError?.message?.toLowerCase().includes("already") ||
    createError?.message?.toLowerCase().includes("registered");

  if (!alreadyExists) {
    throw createError || new Error("Unable to create merchant auth user.");
  }

  const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  const existing = userList.users.find(
    (user) => user.email?.toLowerCase() === RESTAURANT.email.toLowerCase()
  );

  if (!existing) {
    throw new Error(`Could not locate existing auth user for ${RESTAURANT.email}.`);
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
    password: RESTAURANT.password,
    email_confirm: true,
    user_metadata: {
      displayName: RESTAURANT.contactName,
      role: "MERCHANT",
    },
  });
  if (updateError) throw updateError;

  return { userId: existing.id, authCreated: false };
}

async function run() {
  console.log("Seeding Kitchen + Kocktails Charlotte...");

  const now = new Date().toISOString();
  const fullAddress = `${RESTAURANT.street}, ${RESTAURANT.city}, ${RESTAURANT.state} ${RESTAURANT.zip}`;
  const { userId, authCreated } = await getOrCreateAuthUser();

  const { error: userError } = await supabase.from("User").upsert({
    id: userId,
    email: RESTAURANT.email,
    name: RESTAURANT.contactName,
    phone: RESTAURANT.phone,
    role: "MERCHANT",
    address: fullAddress,
    createdAt: now,
    updatedAt: now,
  });

  if (userError) throw userError;

  const { data: existingRestaurant, error: existingRestaurantError } = await supabase
    .from("Restaurant")
    .select("id")
    .eq("name", RESTAURANT.name)
    .maybeSingle();

  if (existingRestaurantError) throw existingRestaurantError;

  const restaurantId = existingRestaurant?.id || uuidv4();

  const restaurantPayload = {
    id: restaurantId,
    ownerId: userId,
    name: RESTAURANT.name,
    address: fullAddress,
    city: RESTAURANT.city,
    state: RESTAURANT.state,
    lat: RESTAURANT.lat,
    lng: RESTAURANT.lng,
    description: RESTAURANT.description,
    imageUrl: RESTAURANT.imageUrl,
    openTime: RESTAURANT.openTime,
    closeTime: RESTAURANT.closeTime,
    visibility: "VISIBLE",
    isMock: false,
    plan: "Flex Options",
    updatedAt: now,
    createdAt: now,
  };

  const { error: restaurantError } = await supabase
    .from("Restaurant")
    .upsert(restaurantPayload, { onConflict: "id" });

  if (restaurantError) throw restaurantError;

  const { error: deleteMenuError } = await supabase
    .from("MenuItem")
    .delete()
    .eq("restaurantId", restaurantId);
  if (deleteMenuError) throw deleteMenuError;

  const menuRowsWithCategory = MENU.map((item) => ({
    id: uuidv4(),
    restaurantId,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    status: "APPROVED",
    inventory: 100,
    createdAt: now,
    updatedAt: now,
  }));

  const { error: menuError } = await supabase.from("MenuItem").insert(menuRowsWithCategory);

  if (menuError) {
    const menuRows = menuRowsWithCategory.map(({ category: _category, ...row }) => row);
    const { error: fallbackMenuError } = await supabase.from("MenuItem").insert(menuRows);
    if (fallbackMenuError) throw fallbackMenuError;
    console.warn("Menu seeded without category column fallback.");
  }

  const orderUrl = `http://localhost:3000/restaurants/kitchen-kocktails-charlotte?address=${encodeURIComponent(fullAddress)}`;
  const marketUrl = `http://localhost:3000/restaurants?search=${encodeURIComponent("Charlotte")}`;

  console.log("\nKitchen + Kocktails Charlotte is ready.");
  console.log("Merchant login:", "http://localhost:3000/merchant/login");
  console.log("Email:", RESTAURANT.email);
  console.log("Password:", RESTAURANT.password);
  console.log("Restaurant ID:", restaurantId);
  console.log("Auth created:", authCreated);
  console.log("Customer order page:", orderUrl);
  console.log("Charlotte market page:", marketUrl);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
