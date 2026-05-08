import { getAuthSession } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import MenuRow from "@/app/merchant/dashboard/MenuRow";
import AddItemForm from "@/app/merchant/dashboard/AddItemForm";
import InventoryManager from "@/app/merchant/dashboard/InventoryManager";
import MerchantPortalRecovery from "../MerchantPortalRecovery";
import { Ban, CheckCircle2, Clock3, Sparkles, UtensilsCrossed } from "lucide-react";

export const dynamic = "force-dynamic";

const PREVIEW_ITEMS = [
    { id: "1", name: "Spicy Ramen Bowl", price: 14.99, description: "Rich tonkotsu broth, chashu pork, soft-boiled egg.", imageUrl: null, isAvailable: true,  status: "APPROVED", ingredients: ["pork", "egg", "noodles"],    saleUntil: new Date(Date.now() + 86400000).toISOString(), originalPrice: 16.99 },
    { id: "2", name: "Truffle Fries",    price: 8.50,  description: "Crispy fries with truffle oil and parmesan.",    imageUrl: null, isAvailable: false, status: "APPROVED", ingredients: ["potato", "truffle", "parmesan"], saleUntil: null, originalPrice: null },
    { id: "3", name: "Mango Tango Bowl", price: 12.00, description: "Açaí base, fresh mango, granola, coconut flakes.", imageUrl: null, isAvailable: true,  status: "PENDING",  ingredients: ["mango", "acai", "granola"],     saleUntil: null, originalPrice: null },
    { id: "4", name: "Seoul Fried Chicken", price: 16.50, description: "Double-fried Korean chicken with gochujang glaze.", imageUrl: null, isAvailable: true, status: "APPROVED", ingredients: ["chicken", "gochujang", "garlic"], saleUntil: null, originalPrice: null },
];

export default async function MerchantMenuPage() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;
    const { userId } = await getAuthSession();
    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) {
        redirect("/login?role=merchant");
    }

    let restaurantId = "preview";
    let menuItems: any[] = PREVIEW_ITEMS;
    let outOfStockIngredients: string[] = ["truffle"];

    if (!isPreview) {
        const { data: restaurants } = await supabaseAdmin
            .from("Restaurant")
            .select("id, outOfStockIngredients, menuItems:MenuItem(*)")
            .eq("ownerId", activeUserId!)
            .single();

        if (!restaurants) return <MerchantPortalRecovery />;

        restaurantId = restaurants.id;
        menuItems = (restaurants.menuItems || []).filter((item: any) => item.status !== "ARCHIVED");
        outOfStockIngredients = restaurants.outOfStockIngredients || [];
    }

    const totalItems    = menuItems.length;
    const available     = menuItems.filter((i: any) => i.isAvailable !== false).length;
    const soldOut86d    = menuItems.filter((i: any) => i.isAvailable === false).length;
    const pendingReview = menuItems.filter((i: any) => i.status === "PENDING").length;
    const activeSpecials = menuItems.filter((i: any) => i.saleUntil && new Date(i.saleUntil) > new Date()).length;

    return (
        <div className="font-sans">
            <style dangerouslySetInnerHTML={{ __html: `
                /* ── heading — matches mch-page-title scale ── */
                .menu-hd-title { font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.01em; line-height: 1.2; margin-bottom: 4px; }
                .menu-hd-title span { color: #f97316; }
                .menu-hd-sub { font-size: 11px; color: #777; margin-bottom: 20px; display: block; }

                /* ── stat cards — exactly matches mch-stat-card ── */
                .menu-stat-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 20px; }
                @media (max-width: 980px) { .menu-stat-row { grid-template-columns: repeat(3, 1fr); } }
                @media (max-width: 640px) { .menu-stat-row { grid-template-columns: 1fr 1fr; } }
                .menu-stat { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 14px; }
                .menu-stat-lbl { font-size: 11px; color: #777; margin-bottom: 7px; display: flex; align-items: center; gap: 6px; }
                .menu-stat-lbl-icon { width: 20px; height: 20px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #f97316; }
                .menu-stat-val { font-size: 27px; font-weight: 700; color: #fff; line-height: 1; }
                .menu-stat-val.orange { color: #f97316; }
                .menu-stat-val.red    { color: #e24b4a; }
                .menu-stat-val.green  { color: #3dd68c; }

                /* ── 86 alert banner ── */
                .menu-86-banner { display: flex; align-items: center; gap: 12px; background: rgba(226,75,74,0.06); border: 1px solid rgba(226,75,74,0.2); border-radius: 8px; padding: 12px 16px; margin-bottom: 18px; }
                .menu-86-badge { font-size: 10px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; background: rgba(226,75,74,0.15); border: 1px solid rgba(226,75,74,0.3); color: #e24b4a; padding: 4px 10px; border-radius: 4px; flex-shrink: 0; }
                .menu-86-txt { font-size: 12px; color: #888; }
                .menu-86-txt strong { color: #e24b4a; }

                /* ── section headings — match merchant portal label style ── */
                .menu-section-hd { font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #555; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; }
                .menu-section-sub { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #333; }

                .menu-empty { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 48px; text-align: center; font-size: 11px; color: #555; font-style: italic; }
                .menu-manager-shell { display: grid; gap: 16px; }
                .menu-feature-card {
                    background: linear-gradient(180deg, #111713 0%, #0d110f 100%);
                    border: 1px solid #202a24;
                    border-radius: 14px;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 14px;
                    margin-bottom: 16px;
                }
                .menu-feature-kicker {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    color: #f97316;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: .14em;
                    text-transform: uppercase;
                    margin-bottom: 7px;
                }
                .menu-feature-card h2 { margin: 0; color: #fff; font-size: 24px; line-height: 1.05; font-weight: 900; letter-spacing: -.02em; }
                .menu-feature-card p { margin: 7px 0 0; color: #a5aea8; font-size: 12px; line-height: 1.55; max-width: 680px; }
                .menu-feature-badge {
                    border: 1px solid rgba(61,214,140,.24);
                    background: rgba(61,214,140,.08);
                    color: #3dd68c;
                    border-radius: 999px;
                    padding: 8px 11px;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: .12em;
                    text-transform: uppercase;
                    white-space: nowrap;
                }
                @media (max-width: 760px) {
                    .menu-feature-card { align-items: flex-start; flex-direction: column; }
                }
            ` }} />

            <section className="menu-feature-card">
                <div>
                    <div className="menu-feature-kicker"><Sparkles size={14} /> Menu Manager</div>
                    <h2>Keep the public menu clean and current.</h2>
                    <p>
                        Add items, remove old menu items, mark 86s, and promote limited-time specials for nearby customers browsing your restaurant page.
                    </p>
                </div>
                <div className="menu-feature-badge">{activeSpecials} active specials</div>
            </section>

            {/* Stats row */}
            <div className="menu-stat-row">
                <div className="menu-stat">
                    <div className="menu-stat-lbl"><span className="menu-stat-lbl-icon"><UtensilsCrossed size={13} aria-hidden="true" /></span>Total Items</div>
                    <div className="menu-stat-val">{totalItems}</div>
                </div>
                <div className="menu-stat">
                    <div className="menu-stat-lbl"><span className="menu-stat-lbl-icon"><CheckCircle2 size={13} aria-hidden="true" /></span>Available</div>
                    <div className="menu-stat-val green">{available}</div>
                </div>
                <div className="menu-stat">
                    <div className="menu-stat-lbl"><span className="menu-stat-lbl-icon"><Ban size={13} aria-hidden="true" /></span>86&apos;d Today</div>
                    <div className={`menu-stat-val${soldOut86d > 0 ? ' red' : ''}`}>{soldOut86d}</div>
                </div>
                <div className="menu-stat">
                    <div className="menu-stat-lbl"><span className="menu-stat-lbl-icon"><Clock3 size={13} aria-hidden="true" /></span>Pending Review</div>
                    <div className={`menu-stat-val${pendingReview > 0 ? ' orange' : ''}`}>{pendingReview}</div>
                </div>
                <div className="menu-stat">
                    <div className="menu-stat-lbl"><span className="menu-stat-lbl-icon"><Sparkles size={13} aria-hidden="true" /></span>Specials</div>
                    <div className={`menu-stat-val${activeSpecials > 0 ? ' orange' : ''}`}>{activeSpecials}</div>
                </div>
            </div>

            {/* 86'd alert banner */}
            {soldOut86d > 0 && (
                <div className="menu-86-banner">
                    <span className="menu-86-badge">86 ALERT</span>
                    <span className="menu-86-txt">
                        <strong>{soldOut86d} item{soldOut86d > 1 ? 's' : ''}</strong> currently marked as sold out and hidden from customers.
                        Hit <strong>Restock</strong> when back in service.
                    </span>
                </div>
            )}

            {/* Menu items list */}
            <div style={{ marginBottom: 32 }}>
                <div className="menu-section-hd">
                    Menu Items
                    <span className="menu-section-sub">{totalItems} items</span>
                </div>
                {menuItems.length === 0 ? (
                    <div className="menu-empty">No menu items yet. Add your first item below.</div>
                ) : (
                    <div className="space-y-2">
                        {menuItems.map((item: any) => (
                            <MenuRow
                                key={item.id}
                                item={item}
                                outOfStockIngredients={outOfStockIngredients}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add item form */}
            <div style={{ marginBottom: 32 }}>
                <div className="menu-section-hd">Add New Item</div>
                <AddItemForm restaurantId={restaurantId} />
            </div>

            {/* Inventory / ingredient manager */}
            {menuItems.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                    <div className="menu-section-hd">Ingredient Inventory</div>
                    <InventoryManager
                        restaurantId={restaurantId}
                        menuItems={menuItems}
                        outOfStockIngredients={outOfStockIngredients}
                    />
                </div>
            )}
        </div>
    );
}
