import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabase-admin";

type SeedMenuItem = {
  category: string;
  name: string;
  description: string;
  price: number;
};

const RESTAURANT = {
  name: "Dank Burrito",
  contactName: "Dank Burrito Rock Hill Team",
  email: "rockhill@dankburrito.com",
  password: "DankBurrito!2026",
  phone: "+1.803-329-5727",
  address: "343 Technology Center Way, Suite 108",
  city: "Rock Hill",
  state: "SC",
  zip: "29730",
  description:
    "Global-flavor burritos, bowls, salads, kid meals, and sides from Dank Burrito's Rock Hill location.",
  imageUrl:
    "https://images.getbento.com/accounts/91db984552a0a3ede9efab8cfbaae4e4/media/images/Dank-Burrito_Rock-Hill_front.jpg?auto=compress%2Cformat&fit=max&h=1000&w=1000",
  openTime: "11:00:00",
  closeTime: "21:00:00",
};

const MENU: SeedMenuItem[] = [
  { category: "Burritos", name: "Cloud 9", description: "Signature burrito with Dank Burrito's house-style build and bold flavor.", price: 12.95 },
  { category: "Burritos", name: "Dank Banger", description: "A fan-favorite burrito packed with the brand's signature flavor profile.", price: 12.45 },
  { category: "Burritos", name: "Porky's Revenge", description: "A savory burrito option built around pork-forward flavor.", price: 12.95 },
  { category: "Burritos", name: "Sticky Icky", description: "A signature burrito with a richer, saucier finish.", price: 13.25 },
  { category: "Burritos", name: "California Dreaming", description: "West-coast inspired burrito build with fresh, craveable toppings.", price: 12.95 },

  { category: "Bowls", name: "Need 4 Greens", description: "Fresh bowl option built for a lighter, greens-forward meal.", price: 12.95 },
  { category: "Bowls", name: "Purple Haze", description: "Bold bowl with colorful, chef-driven toppings.", price: 12.95 },
  { category: "Bowls", name: "The Big Easy", description: "A flavor-packed bowl with southern-inspired personality.", price: 12.95 },
  { category: "Bowls", name: "Sunnyside Up", description: "A hearty bowl option with bright, balanced flavor.", price: 12.95 },
  { category: "Bowls", name: "Veggie Delight", description: "Vegetable-forward bowl with fresh ingredients and house flavor.", price: 10.95 },

  { category: "Quesadillas", name: "Chicken Bacon Ranch Quesadilla", description: "Secret-menu style quesadilla with chicken, bacon, and ranch-inspired flavor.", price: 12.45 },

  { category: "Salads", name: "Need 4 Greens Salad", description: "The Need 4 Greens build served as a salad.", price: 12.95 },
  { category: "Salads", name: "Purple Haze Salad", description: "The Purple Haze build served over fresh greens.", price: 12.95 },
  { category: "Salads", name: "The Big Easy Salad", description: "The Big Easy flavor profile served as a salad.", price: 12.95 },
  { category: "Salads", name: "Veggie Delight Salad", description: "A lighter salad version of the Veggie Delight favorite.", price: 10.95 },

  { category: "Sides", name: "Guacamole Side", description: "Side portion of fresh guacamole.", price: 3.65 },
  { category: "Sides", name: "Queso Side", description: "Side portion of creamy queso.", price: 3.65 },
  { category: "Sides", name: "Chips & Queso", description: "House chips served with queso.", price: 6.75 },
  { category: "Sides", name: "Chips & Salsa", description: "House chips served with salsa.", price: 4.45 },
  { category: "Sides", name: "Chips & Guacamole", description: "House chips served with guacamole.", price: 6.75 },
  { category: "Sides", name: "Chips and Side", description: "House chips served with your choice of dip.", price: 3.95 },
  { category: "Sides", name: "Small Queso", description: "Small queso cup.", price: 2.65 },
  { category: "Sides", name: "Large Queso", description: "Large queso cup.", price: 5.45 },
  { category: "Sides", name: "Small Salsa", description: "Small salsa cup.", price: 2.65 },
  { category: "Sides", name: "Large Salsa", description: "Large salsa cup.", price: 5.45 },

  { category: "Kids Meals", name: "Kids Bowl", description: "Kid-sized bowl served with simple, family-friendly flavors.", price: 7.75 },
  { category: "Kids Meals", name: "Kids Burrito", description: "Kid-sized burrito built for smaller appetites.", price: 7.75 },
  { category: "Kids Meals", name: "Kids Quesadilla", description: "Kid-sized quesadilla served as a simple meal option.", price: 7.75 },

  { category: "Desserts", name: "Fried Oreos", description: "Warm fried Oreos for a sweet finish.", price: 4.45 },
  { category: "Desserts", name: "Funnel Fries", description: "Funnel-cake style fries dusted for dessert.", price: 4.45 },
  { category: "Desserts", name: "Vanilla Crème Brulee", description: "Creamy vanilla crème brulee dessert.", price: 5.25 },

  { category: "Drinks", name: "Sweet Tea", description: "Freshly served sweet tea.", price: 2.75 },
  { category: "Drinks", name: "Unsweet Tea", description: "Freshly served unsweet tea.", price: 2.75 },
  { category: "Drinks", name: "Coke", description: "Classic Coca-Cola.", price: 2.75 },
  { category: "Drinks", name: "Diet Coke", description: "Diet Coca-Cola.", price: 2.75 },
  { category: "Drinks", name: "Coke Zero", description: "Coke Zero Sugar.", price: 2.75 },
  { category: "Drinks", name: "Sprite", description: "Sprite.", price: 2.75 },
  { category: "Drinks", name: "Lemonade", description: "Fresh lemonade.", price: 2.75 },
  { category: "Drinks", name: "Bottled Water", description: "Bottled water.", price: 2.45 },
];

async function geocodeRestaurant(address: string) {
  const fallback = { lat: 34.9406, lng: -81.0251 };
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return fallback;

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    const payload = await response.json();
    if (payload?.status === "OK") {
      const location = payload.results?.[0]?.geometry?.location;
      if (typeof location?.lat === "number" && typeof location?.lng === "number") {
        return { lat: location.lat, lng: location.lng };
      }
    }
  } catch {
    // Fall back to Rock Hill center.
  }

  return fallback;
}

async function getOrCreateAuthUser() {
  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email: RESTAURANT.email,
    password: RESTAURANT.password,
    email_confirm: true,
    user_metadata: {
      displayName: RESTAURANT.contactName,
      role: "MERCHANT",
    },
  });

  if (created?.user) {
    return { userId: created.user.id, created: true };
  }

  if (error && !error.message.toLowerCase().includes("already")) {
    throw error;
  }

  const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
  const existing = userList.users.find((user) => user.email?.toLowerCase() === RESTAURANT.email.toLowerCase());
  if (!existing) {
    throw new Error("Could not locate existing auth user for Dank Burrito Rock Hill.");
  }

  await supabaseAdmin.auth.admin.updateUserById(existing.id, {
    password: RESTAURANT.password,
    email_confirm: true,
    user_metadata: {
      displayName: RESTAURANT.contactName,
      role: "MERCHANT",
    },
  });

  return { userId: existing.id, created: false };
}

export async function seedDankBurrito() {
  const now = new Date().toISOString();
  const { userId, created: authCreated } = await getOrCreateAuthUser();
  const fullAddress = `${RESTAURANT.address}, ${RESTAURANT.city}, ${RESTAURANT.state} ${RESTAURANT.zip}`;
  const { lat, lng } = await geocodeRestaurant(fullAddress);

  await supabaseAdmin.from("User").upsert({
    id: userId,
    email: RESTAURANT.email,
    name: RESTAURANT.contactName,
    phone: RESTAURANT.phone,
    role: "MERCHANT",
    address: fullAddress,
    createdAt: now,
    updatedAt: now,
  });

  const { data: existingRestaurant } = await supabaseAdmin
    .from("Restaurant")
    .select("id")
    .eq("ownerId", userId)
    .maybeSingle();

  const restaurantId = existingRestaurant?.id || uuidv4();
  const restaurantPayload = {
    id: restaurantId,
    ownerId: userId,
    name: RESTAURANT.name,
    address: fullAddress,
    city: RESTAURANT.city,
    state: RESTAURANT.state,
    lat,
    lng,
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

  const { error: restaurantError } = await supabaseAdmin.from("Restaurant").upsert(restaurantPayload, {
    onConflict: "id",
  });

  if (restaurantError) {
    throw restaurantError;
  }

  await supabaseAdmin.from("MenuItem").delete().eq("restaurantId", restaurantId);

  const menuRows = MENU.map((item) => ({
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

  const { error: menuError } = await supabaseAdmin.from("MenuItem").insert(menuRows);
  if (menuError) {
    if (menuError.message?.toLowerCase().includes("category")) {
      const fallbackRows = menuRows.map(({ category, ...rest }) => rest);
      const { error: fallbackError } = await supabaseAdmin.from("MenuItem").insert(fallbackRows);
      if (fallbackError) throw fallbackError;
    } else {
      throw menuError;
    }
  }

  return {
    success: true,
    restaurantId,
    userId,
    login: {
      email: RESTAURANT.email,
      password: RESTAURANT.password,
    },
    restaurant: {
      name: RESTAURANT.name,
      address: fullAddress,
      city: RESTAURANT.city,
      state: RESTAURANT.state,
      lat,
      lng,
    },
    menuCount: menuRows.length,
    authCreated,
  };
}
