"use client";

import { useState, useTransition } from "react";
import { toggleItemStock } from "../../actions";
import EditItemModal from "../EditItemModal";
import AddItemForm from "../AddItemForm";

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
             setItems(prev => prev.map(i => i.id === itemId ? { ...i, isAvailable: !currentStatus } : i));
             try {
                await toggleItemStock(itemId, currentStatus);
             } catch (e) {
                setItems(prev => prev.map(i => i.id === itemId ? { ...i, isAvailable: currentStatus } : i));
                alert("Terminal Sync Failure: Stock state could not be updated.");
             }
        });
    };

    return (
        <div className="space-y-10">
            {/* COMMAND HUD */}
            <div className="flex flex-col xl:flex-row justify-between items-center gap-6 bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] backdrop-blur-3xl shadow-2xl">
                 <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-auto">
                    <div className="relative w-full md:w-96 group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#e8a230] transition-colors">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Identify Asset by Name..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white font-barlow-cond uppercase tracking-widest placeholder:text-slate-600 outline-none focus:border-[#e8a230]/50 focus:bg-black/60 transition-all font-bold"
                        />
                    </div>
                    
                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                        {["all", "in-stock", "out-of-stock"].map((st) => (
                            <button
                                key={st}
                                onClick={() => setFilterStatus(st as any)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all italic ${filterStatus === st ? 'bg-[#e8a230] text-black shadow-glow shadow-[#e8a230]/10' : 'text-slate-500 hover:text-white'}`}
                            >
                                {st.replace("-", " ")}
                            </button>
                        ))}
                    </div>
                 </div>
                 
                 <button 
                    onClick={() => setIsAdding(true)}
                    className="w-full xl:w-auto bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-[0.25em] text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 italic"
                 >
                    + Manifest New Asset
                 </button>
            </div>

            {/* ASSET GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredItems.map((item) => (
                    <div key={item.id} className="relative group bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-[#e8a230]/30 hover:-translate-y-2 hover:bg-white/[0.04] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        {/* Scanline Texture Overlay */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

                        <div className={`absolute top-6 right-6 z-20 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest italic backdrop-blur-xl ${item.isAvailable ? 'bg-[#3dd68c]/10 border-[#3dd68c]/30 text-[#3dd68c]' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                            {item.isAvailable ? "Uplink: Live" : "Signal: Dead"}
                        </div>
                        
                        <div className="relative h-56 overflow-hidden">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100" />
                            ) : (
                                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-5xl opacity-10">📦</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e13] via-transparent to-transparent"></div>
                            
                            <div className="absolute bottom-6 left-8 right-8">
                                <h3 className="text-3xl font-bebas italic uppercase tracking-tight text-white mb-2 leading-none">{item.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bebas italic text-[#e8a230]">${Number(item.price).toFixed(2)}</span>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Unit Price</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 pt-4">
                             <p className="text-slate-500 text-[11px] font-semibold leading-relaxed line-clamp-2 h-9 mb-8 italic opacity-60 group-hover:opacity-100 transition-opacity">
                                {item.description || "Industrial specification asset. Optimized for high-throughput culinary fulfillment pipelines."}
                             </p>

                             <div className="flex gap-4">
                                <button 
                                    onClick={() => setEditingItem(item)}
                                    className="flex-1 bg-white/[0.03] border border-white/5 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-white/[0.08] hover:border-white/20 transition-all italic text-slate-400 hover:text-white"
                                >
                                    Reconfigure
                                </button>
                                <button 
                                    onClick={() => handleToggleStock(item.id, item.isAvailable)}
                                    disabled={isPending}
                                    className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all border italic ${
                                        item.isAvailable 
                                        ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/30' 
                                        : 'bg-[#3dd68c]/10 text-[#3dd68c] border-[#3dd68c]/20 hover:bg-[#3dd68c]/30'
                                    }`}
                                >
                                    {isPending ? "..." : (item.isAvailable ? "Flag Out" : "Secure In")}
                                </button>
                             </div>
                        </div>
                    </div>
                ))}

                {filteredItems.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-white/[0.01] border border-white/5 border-dashed rounded-[3rem] group hover:border-[#e8a230]/20 transition-colors">
                         <span className="text-6xl mb-6 block opacity-10 group-hover:opacity-30 transition-opacity">🛰️</span>
                         <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-[10px] italic">No signatures detected on current frequency.</p>
                    </div>
                )}
            </div>

            {/* MODAL HANDLERS */}
            {editingItem && (
                <EditItemModal 
                    item={editingItem} 
                    onClose={() => setEditingItem(null)} 
                />
            )}

            {isAdding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setIsAdding(false)}></div>
                    <div className="relative w-full max-w-xl animate-fade-in-up">
                         <AddItemForm />
                         <div className="mt-8 flex items-center justify-center gap-3">
                             <div className="w-8 h-px bg-white/10"></div>
                             <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-700 italic">Secure Asset Manifest System</p>
                             <div className="w-8 h-px bg-white/10"></div>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
}

