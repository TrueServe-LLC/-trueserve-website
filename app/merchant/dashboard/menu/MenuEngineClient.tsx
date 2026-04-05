"use client";

import { useState, useTransition } from "react";
import { toggleItemStock } from "../../actions";
import EditItemModal from "../EditItemModal";
import AddItemForm from "../AddItemForm"; // Or I'll build a modal version

interface MenuEngineProps {
    initialItems: any[];
    restaurantId: string;
    outOfStockIngredients: string[];
}

export default function MenuEngineClient({ initialItems, restaurantId, outOfStockIngredients }: MenuEngineProps) {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "in-stock" | "out-of-stock">("all");
    const [items, setItems] = useState(initialItems);
    const [isAdding, setIsAdding] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isPending, startTransition] = useTransition();

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === "all" || 
            (filterStatus === "in-stock" && item.isAvailable) ||
            (filterStatus === "out-of-stock" && !item.isAvailable);
        return matchesSearch && matchesStatus;
    });

    const handleToggleStock = async (itemId: string, currentStatus: boolean) => {
        startTransition(async () => {
             // Optimized UI feedback: toggle first, then call action
             setItems(prev => prev.map(i => i.id === itemId ? { ...i, isAvailable: !currentStatus } : i));
             try {
                await toggleItemStock(itemId, currentStatus);
             } catch (e) {
                // Rollback if failed
                setItems(prev => prev.map(i => i.id === itemId ? { ...i, isAvailable: currentStatus } : i));
                alert("Failed to update stock state.");
             }
        });
    };

    return (
        <div className="space-y-8">
            <style jsx>{`
                .engine-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 32px; }
                .item-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 2.5rem; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; }
                .item-card:hover { transform: translateY(-8px); border-color: rgba(232, 162, 48, 0.3); background: rgba(255,255,255,0.04); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
                .item-badge { position: absolute; top: 20px; right: 20px; z-index: 10; padding: 6px 12px; border-radius: 1rem; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.12em; backdrop-filter: blur(12px); border: 1.5px solid rgba(255,255,255,0.1); }
                .badge-live { color: #3dd68c; background: rgba(61, 214, 140, 0.15); border-color: rgba(61, 214, 140, 0.25); }
                .badge-off { color: #e24b4a; background: rgba(226, 75, 74, 0.15); border-color: rgba(226, 75, 74, 0.25); }
                .search-bar { background: #0f1219; border: 1px solid #1c1f28; border-radius: 20px; padding: 14px 24px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #fff; width: 100%; max-width: 400px; outline: none; transition: border-color 0.2s; }
                .search-bar:focus { border-color: #e8a230; }
            `}</style>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
                 <div className="flex items-center gap-6 w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="Search Catalog Asset..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-bar"
                    />
                    <div className="flex bg-[#0c0e13] p-1 rounded-2xl border border-white/5">
                        {["all", "in-stock", "out-of-stock"].map((st) => (
                            <button
                                key={st}
                                onClick={() => setFilterStatus(st as any)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === st ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
                            >
                                {st.replace("-", " ")}
                            </button>
                        ))}
                    </div>
                 </div>
                 <button 
                    onClick={() => setIsAdding(true)}
                    className="w-full md:w-auto bg-[#fff] text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
                 >
                    + Create New Asset
                 </button>
            </div>

            <div className="engine-grid">
                {filteredItems.map((item) => (
                    <div key={item.id} className="item-card group">
                        <div className={`item-badge ${item.isAvailable ? 'badge-live' : 'badge-off'}`}>
                            {item.isAvailable ? "In-Stock" : "Out-of-Stock"}
                        </div>
                        
                        <div className="relative h-64 overflow-hidden">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-3xl opacity-20">🍴</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                            
                            <div className="absolute bottom-6 left-6 right-6">
                                <h3 className="text-2xl font-black italic uppercase tracking-tight text-white mb-1">{item.name}</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-primary">${Number(item.price).toFixed(2)}</span>
                                    {item.originalPrice && <span className="text-sm text-slate-500 line-through">${Number(item.originalPrice).toFixed(2)}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 pt-2">
                             <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-2 h-10 mb-6 italic opacity-80">
                                {item.description || "The industrial definition of culinary performance. Freshly prepared, elite logistics synchronization ready."}
                             </p>

                             <div className="flex gap-3">
                                <button 
                                    onClick={() => setEditingItem(item)}
                                    className="flex-1 bg-white/5 border border-white/10 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-white/10 transition-colors"
                                >
                                    Modify
                                </button>
                                <button 
                                    onClick={() => handleToggleStock(item.id, item.isAvailable)}
                                    disabled={isPending}
                                    className={`flex-1 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all border ${
                                        item.isAvailable 
                                        ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' 
                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                    }`}
                                >
                                    {isPending ? "..." : (item.isAvailable ? "Flag Out" : "Secure In")}
                                </button>
                             </div>
                        </div>
                    </div>
                ))}

                {filteredItems.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-900/20 border border-white/5 border-dashed rounded-[3rem]">
                         <span className="text-4xl mb-4 block opacity-20">🔍</span>
                         <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No assets detected matching current telemetry.</p>
                    </div>
                )}
            </div>

            {/* MODALS */}
            {editingItem && (
                <EditItemModal 
                    item={editingItem} 
                    onClose={() => setEditingItem(null)} 
                />
            )}

            {isAdding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAdding(false)}></div>
                    <div className="relative w-full max-w-xl animate-fade-in-up">
                         <AddItemForm />
                         <p className="text-center mt-4 text-[9px] font-black uppercase tracking-widest text-slate-600">Secure Industrial Asset Creation Hub</p>
                    </div>
                </div>
            )}
        </div>
    );
}
