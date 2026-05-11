import { getAuthSession } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import TrueProfitPanel from "@/app/merchant/dashboard/TrueProfitPanel";
import MenuEngineeringPanel from "@/app/merchant/dashboard/MenuEngineeringPanel";
import CustomerLoyaltyPanel from "@/app/merchant/dashboard/CustomerLoyaltyPanel";
import OrderAccuracyPanel from "@/app/merchant/dashboard/OrderAccuracyPanel";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
    const { userId } = await getAuthSession();
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;
    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) {
        redirect("/login?role=merchant&next=/merchant/dashboard/insights");
    }

    let restaurant: any = null;
    let orders: any[] = [];
    let menuItems: any[] = [];

    if (isPreview) {
        restaurant = { id: "preview", name: "Pilot Kitchen", foodCostPct: 30, laborCostPct: 25 };
        orders = [];
        menuItems = [];
    } else {
        const { data: restaurants } = await supabaseAdmin
            .from("Restaurant")
            .select("id, name, foodCostPct, laborCostPct")
            .eq("ownerId", activeUserId!)
            .limit(1);

        if (!restaurants || restaurants.length === 0) {
            redirect("/merchant/signup");
        }

        restaurant = restaurants[0];

        const [ordersResult, menuResult] = await Promise.all([
            supabaseAdmin
                .from("Order")
                .select(`
                    id, status, total, createdAt, updatedAt, userId, disputeFlag, disputeType, cancelComment, pickedUpAt,
                    user:User(id, name, email),
                    orderItems:OrderItem(id, quantity, price, menuItemId, MenuItem(id, name, price)),
                    driver:Driver(id, userId, user:User(name, phone))
                `)
                .eq("restaurantId", restaurant.id)
                .order("createdAt", { ascending: false })
                .limit(500),
            supabaseAdmin
                .from("MenuItem")
                .select("id, name, price, costPrice, category, isAvailable, sales")
                .eq("restaurantId", restaurant.id)
                .eq("isAvailable", true),
        ]);

        orders = ordersResult.data || [];
        menuItems = menuResult.data || [];
    }

    return (
        <div>
            <p style={{ fontSize: 11, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 20, marginTop: -4 }}>
                Business intelligence tools built for restaurant operators.
            </p>

            <TrueProfitPanel
                orders={orders}
                restaurantId={restaurant.id}
                initialFoodCostPct={restaurant.foodCostPct ?? 30}
                initialLaborCostPct={restaurant.laborCostPct ?? 25}
            />

            <MenuEngineeringPanel
                menuItems={menuItems}
                orders={orders}
            />

            <CustomerLoyaltyPanel orders={orders} />

            <OrderAccuracyPanel orders={orders} restaurantId={restaurant.id} />
        </div>
    );
}
