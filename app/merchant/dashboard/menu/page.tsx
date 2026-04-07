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
        <div className="space-y-10 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-white/5">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-[#e8a230] shadow-glow"></div>
                         <h1 className="text-4xl md:text-5xl font-bebas italic text-white uppercase tracking-tight">Catalog Architect</h1>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">// Sector: {restaurant.name} · Asset Management</p>
                </div>
                
                <div className="flex gap-4">
                    <div className="bg-white/[0.02] border border-white/5 px-8 py-4 rounded-[1.5rem] flex flex-col items-center min-w-[140px] relative overflow-hidden group hover:border-[#e8a230]/20 transition-all">
                        <span className="text-[9px] uppercase font-black text-slate-600 tracking-widest italic group-hover:text-white transition-colors relative z-10">Deployed Assets</span>
                        <span className="text-3xl font-bebas italic text-white relative z-10">{menuItems.filter(i => i.isAvailable).length}</span>
                        <div className="absolute top-0 right-0 p-4 text-3xl opacity-[0.02] font-bebas italic select-none">NET</div>
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

