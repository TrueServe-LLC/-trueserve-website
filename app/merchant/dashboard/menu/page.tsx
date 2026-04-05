import { createClient } from "@/lib/supabase/server";
import { getAuthSession } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import MenuEngineClient from "./MenuEngineClient";

export const dynamic = "force-dynamic";

export default async function MerchantMenuPage() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;
    const { isAuth, userId } = await getAuthSession();
    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) {
        redirect("/login?role=merchant");
    }

    let restaurant: any = null;
    let menuItems: any[] = [];

    if (isPreview) {
        restaurant = { name: "Emerald Kitchen (Preview)", id: "preview" };
        menuItems = [
            { id: "1", name: "Classic Wagyu Burger", price: 18.50, description: "A5 Wagyu beef, truffle aioli, charred onion jam.", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400", isAvailable: true, status: "APPROVED" },
            { id: "2", name: "Truffle Parmesan Fries", price: 9.00, description: "Hand-cut russet potatoes, white truffle oil, 24-month aged parm.", imageUrl: "https://images.unsplash.com/photo-1630384066252-427210626359?q=80&w=400", isAvailable: true, status: "APPROVED" },
            { id: "3", name: "Artisanal Matcha Latte", price: 6.50, description: "Ceremonial grade matcha, organic oat milk, hint of vanilla.", imageUrl: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=400", isAvailable: false, status: "APPROVED" }
        ];
    } else {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("Restaurant")
            .select("*, menuItems:MenuItem(*)")
            .eq("ownerId", activeUserId!)
            .single();

        if (error || !data) {
            redirect("/merchant-signup");
        }
        restaurant = data;
        menuItems = data.menuItems || [];
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tight text-white mb-2">
                        Menu <span className="text-primary italic">Engine.</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                        Industrial Catalog Management · {restaurant.name}
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-900 border border-white/5 px-6 py-3 rounded-2xl flex flex-col items-center">
                        <span className="text-[10px] uppercase font-black text-slate-600 tracking-tighter">Live Items</span>
                        <span className="text-xl font-black">{menuItems.filter(i => i.isAvailable).length}</span>
                    </div>
                </div>
            </div>

            <MenuEngineClient 
                initialItems={menuItems} 
                restaurantId={restaurant.id} 
                outOfStockIngredients={restaurant.outOfStockIngredients || []}
            />
        </div>
    );
}
