import { cookies } from "next/headers";
import HomePageClient from "@/components/HomePageClient";
import { createClient } from "@/lib/supabase/server";
import { buildHomepageCollections, type PublicRestaurantRecord } from "@/lib/public-restaurants";

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value || null;
  const supabase = await createClient();

  const { data: restaurants } = await supabase
    .from("Restaurant")
    .select("id, name, address, city, state, description, visibility, isApproved, isMock, imageUrl, bannerUrl, coverImageUrl, cuisineType, rating, healthGrade, complianceStatus, menuItems:MenuItem(name, category, imageUrl, status)")
    .limit(60);

  const discoveryCards = buildHomepageCollections((restaurants || []) as PublicRestaurantRecord[]);

  return <HomePageClient userId={userId} discoveryCards={discoveryCards} />;
}
