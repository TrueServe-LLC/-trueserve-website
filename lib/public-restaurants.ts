export interface PublicRestaurantRecord {
  id: string;
  name?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  visibility?: string | null;
  isApproved?: boolean | null;
  isMock?: boolean | null;
  rating?: number | string | null;
  healthGrade?: string | null;
  complianceStatus?: string | null;
  complianceScore?: number | null;
  createdAt?: string | null;
  lat?: number | null;
  lng?: number | null;
  [key: string]: unknown;
}

export interface PublicRestaurantCollection {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  restaurants: PublicRestaurantRecord[];
}

export interface PublicMenuItemRecord {
  id: string;
  restaurantId: string;
  name?: string | null;
  category?: string | null;
  price?: number | null;
  status?: string | null;
  isAvailable?: boolean | null;
  [key: string]: unknown;
}

export interface MenuMomentEntry {
  id: string;
  itemName: string;
  restaurantName: string;
  priceLabel: string;
  cityLabel: string;
  imageUrl: string | null;
}

export interface MenuMomentCollection {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  entries: MenuMomentEntry[];
}

const TEST_DATA_PATTERN = /\b(mock|test|demo|preview|sandbox|sample|qa|staging|seed)\b/i;
const EXCLUDED_CITIES = new Set(["mount airy"]);
const EXCLUDED_RESTAURANT_NAMES = new Set(["costa del sol", "costo del sol"]);

export function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function isVerifiedKitchen(restaurant: PublicRestaurantRecord) {
  const grade = String(restaurant.healthGrade || "").toUpperCase();
  const status = String(restaurant.complianceStatus || "").toUpperCase();
  return ["PASS", "APPROVED", "COMPLIANT"].includes(status) && ["A", "B"].includes(grade);
}

export function getLiveRestaurants(restaurants: PublicRestaurantRecord[]) {
  return restaurants.filter((restaurant) => {
    const visibility = typeof restaurant.visibility === "string" ? restaurant.visibility.toUpperCase() : "";
    const searchableText = `${restaurant.name || ""} ${restaurant.address || ""} ${restaurant.city || ""} ${restaurant.description || ""}`;
    const normalizedName = normalizeSearchText(String(restaurant.name || ""));
    const isMock = restaurant.isMock === true;
    const isLikelyTestRecord =
      TEST_DATA_PATTERN.test(searchableText) || searchableText.toLowerCase().includes("(mock)");
    const isExcludedCity = EXCLUDED_CITIES.has(String(restaurant.city || "").trim().toLowerCase());
    const isExcludedRestaurant = EXCLUDED_RESTAURANT_NAMES.has(normalizedName);
    const isVisible = !visibility || visibility === "VISIBLE";
    const hasApprovalColumn = Object.prototype.hasOwnProperty.call(restaurant, "isApproved");
    const isApproved = !hasApprovalColumn || restaurant.isApproved !== false;

    return !isMock && !isLikelyTestRecord && !isExcludedCity && !isExcludedRestaurant && isVisible && isApproved;
  });
}

export function addDistanceMiles(
  restaurants: PublicRestaurantRecord[],
  targetLat: number | null,
  targetLng: number | null
) {
  return restaurants.map((restaurant) => {
    const hasCoords = typeof restaurant.lat === "number" && typeof restaurant.lng === "number";
    let distanceMiles: number | null = null;

    if (targetLat !== null && targetLng !== null && hasCoords && restaurant.lat !== null && restaurant.lng !== null) {
      const toRad = (value: number) => (value * Math.PI) / 180;
      const earthMiles = 3958.8;
      const dLat = toRad(restaurant.lat - targetLat);
      const dLng = toRad(restaurant.lng - targetLng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(targetLat)) * Math.cos(toRad(restaurant.lat)) * Math.sin(dLng / 2) ** 2;
      distanceMiles = 2 * earthMiles * Math.asin(Math.sqrt(a));
    }

    return { ...restaurant, distanceMiles };
  });
}

export function buildHomeCollections(restaurants: PublicRestaurantRecord[]): PublicRestaurantCollection[] {
  const live = getLiveRestaurants(restaurants);
  const byRating = [...live].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  const verified = live
    .filter(isVerifiedKitchen)
    .sort((a, b) => Number(b.complianceScore || 0) - Number(a.complianceScore || 0));
  const newest = [...live].sort((a, b) => {
    const aTime = new Date(String(a.createdAt || 0)).getTime();
    const bTime = new Date(String(b.createdAt || 0)).getTime();
    return bTime - aTime;
  });
  const localFavorites = [...live].sort((a, b) => {
    const aScore = Number(a.rating || 0) * 20 + Number(a.complianceScore || 0);
    const bScore = Number(b.rating || 0) * 20 + Number(b.complianceScore || 0);
    return bScore - aScore;
  });

  return [
    {
      key: "top-rated",
      eyebrow: "Top Rated",
      title: "Best reviewed on TrueServe",
      description: "Restaurants leading on review quality and repeat-customer confidence.",
      href: "/restaurants",
      restaurants: byRating.slice(0, 3),
    },
    {
      key: "verified-kitchens",
      eyebrow: "Verified Kitchens",
      title: "Operators we can stand behind",
      description: "Restaurants with strong compliance signals and a cleaner guest experience.",
      href: "/restaurants",
      restaurants: verified.slice(0, 3),
    },
    {
      key: "fresh-on-trueserve",
      eyebrow: "Fresh On TrueServe",
      title: "New partner spots to try",
      description: "Recently launched restaurants ready for discovery and first orders.",
      href: "/restaurants",
      restaurants: newest.slice(0, 3),
    },
    {
      key: "local-favorites",
      eyebrow: "Neighborhood Favorites",
      title: "Strong food, stronger operations",
      description: "A blend of ratings, trust, and operational quality for pilot-ready discovery.",
      href: "/restaurants",
      restaurants: localFavorites.slice(0, 3),
    },
  ].filter((collection) => collection.restaurants.length > 0);
}

export function summarizeRestaurantNetwork(restaurants: PublicRestaurantRecord[]) {
  const live = getLiveRestaurants(restaurants);
  const ratingValues = live
    .map((restaurant) => Number(restaurant.rating || 0))
    .filter((rating) => Number.isFinite(rating) && rating > 0);
  const markets = new Set(
    live
      .map((restaurant) => `${String(restaurant.city || "").trim()}|${String(restaurant.state || "").trim()}`)
      .filter((value) => value !== "|")
  );

  return {
    totalRestaurants: live.length,
    verifiedCount: live.filter(isVerifiedKitchen).length,
    markets: markets.size,
    averageRating: ratingValues.length
      ? Math.round((ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length) * 10) / 10
      : null,
  };
}

export function extractStateCode(value: string) {
  const match = value.toUpperCase().match(/\b([A-Z]{2})\b/);
  return match ? match[1] : null;
}

export function matchesRestaurantSearch(
  restaurant: PublicRestaurantRecord,
  targetRaw: string,
  targetCityToken: string,
  targetTokens: string[]
) {
  const targetSearch = targetRaw.toLowerCase();
  if (!targetSearch) return false;

  const haystack = `${restaurant.name || ""} ${restaurant.city || ""} ${restaurant.state || ""} ${restaurant.address || ""}`.toLowerCase();
  const haystackNormalized = normalizeSearchText(haystack);

  if (haystack.includes(targetSearch)) return true;
  if (targetCityToken && haystackNormalized.includes(targetCityToken)) return true;
  if (targetTokens.length === 0) return false;

  const matchingTokens = targetTokens.filter((token) => haystackNormalized.includes(token)).length;
  const requiredMatches = Math.min(2, targetTokens.length);
  return matchingTokens >= requiredMatches;
}

function moneyLabel(price?: number | null) {
  return typeof price === "number" && Number.isFinite(price) ? `$${price.toFixed(2)}` : "Live now";
}

function categoryKey(item: PublicMenuItemRecord) {
  return String(item.category || "").trim().toLowerCase();
}

function itemNameKey(item: PublicMenuItemRecord) {
  return String(item.name || "").trim().toLowerCase();
}

function isLiveMenuItem(item: PublicMenuItemRecord) {
  const status = String(item.status || "").toUpperCase();
  const isApproved = !status || status === "APPROVED";
  const isAvailable = item.isAvailable !== false;
  return isApproved && isAvailable;
}

function toMomentEntry(
  item: PublicMenuItemRecord,
  restaurant: PublicRestaurantRecord | undefined
): MenuMomentEntry | null {
  if (!restaurant || !item.name) return null;
  return {
    id: item.id,
    itemName: String(item.name),
    restaurantName: String(restaurant.name || "Local partner"),
    priceLabel: moneyLabel(item.price),
    cityLabel: [restaurant.city, restaurant.state].filter(Boolean).join(", ") || "TrueServe",
    imageUrl: restaurant.imageUrl || null,
  };
}

export function buildMenuMoments(
  restaurants: PublicRestaurantRecord[],
  menuItems: PublicMenuItemRecord[]
): MenuMomentCollection[] {
  const liveRestaurants = getLiveRestaurants(restaurants);
  const restaurantMap = new Map(liveRestaurants.map((restaurant) => [restaurant.id, restaurant]));
  const eligibleItems = menuItems.filter((item) => restaurantMap.has(item.restaurantId) && isLiveMenuItem(item));

  const lunch = eligibleItems
    .filter((item) => {
      const category = categoryKey(item);
      const name = itemNameKey(item);
      return (
        ["bowls", "salads", "sandwiches", "lunch", "quesadillas", "small plates"].includes(category) ||
        ["salad", "bowl", "wrap", "sandwich", "quesadilla", "burger", "po-boy"].some((needle) => name.includes(needle))
      );
    })
    .slice(0, 3)
    .map((item) => toMomentEntry(item, restaurantMap.get(item.restaurantId)))
    .filter(Boolean) as MenuMomentEntry[];

  const shareable = eligibleItems
    .filter((item) => {
      const category = categoryKey(item);
      const name = itemNameKey(item);
      return (
        ["sides", "small plates", "appetizers"].includes(category) ||
        ["chips", "dip", "wings", "calamari", "ribs", "hummus", "queso", "guacamole"].some((needle) => name.includes(needle))
      );
    })
    .slice(0, 3)
    .map((item) => toMomentEntry(item, restaurantMap.get(item.restaurantId)))
    .filter(Boolean) as MenuMomentEntry[];

  const sweet = eligibleItems
    .filter((item) => {
      const category = categoryKey(item);
      const name = itemNameKey(item);
      return (
        category === "desserts" ||
        ["oreo", "cake", "pie", "pudding", "cobbler", "brulee", "fries"].some((needle) => name.includes(needle))
      );
    })
    .slice(0, 3)
    .map((item) => toMomentEntry(item, restaurantMap.get(item.restaurantId)))
    .filter(Boolean) as MenuMomentEntry[];

  return [
    {
      key: "fast-lunch",
      eyebrow: "Fast Lunch Picks",
      title: "Real menu items for a faster midday order",
      description: "Live menu items pulled from restaurant menus, not editorial placeholders.",
      href: "/restaurants",
      entries: lunch,
    },
    {
      key: "shareable-comfort",
      eyebrow: "Shareable Comfort Food",
      title: "Appetizers and sides that anchor bigger baskets",
      description: "The kinds of add-ons that make delivery feel a little more worth it.",
      href: "/restaurants",
      entries: shareable,
    },
    {
      key: "sweet-finish",
      eyebrow: "Sweet Finish",
      title: "Dessert options that keep the order value climbing",
      description: "A simple pilot-ready way to surface higher-intent add-ons from real menus.",
      href: "/restaurants",
      entries: sweet,
    },
  ].filter((collection) => collection.entries.length > 0);
}
