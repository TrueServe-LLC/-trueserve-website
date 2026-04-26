"use client";

import { useState } from "react";
import { toggleItemStock } from "../actions";
import EditItemModal from "./EditItemModal";

interface MenuRowProps {
    item: any;
    outOfStockIngredients: string[];
}

export default function MenuRow({ item, outOfStockIngredients }: MenuRowProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const missingIngredients = (item.ingredients || []).filter((ing: string) => 
        outOfStockIngredients.includes(ing.toLowerCase())
    );


    const handleToggleStock = async () => {
        setIsUpdating(true);
        try {
            await toggleItemStock(item.id, item.isAvailable);
        } catch (e) {
            alert("Failed to update stock.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div key={item.id} className={`card p-4 flex justify-between items-center hover:bg-white/5 transition-all ${item.isAvailable === false ? 'opacity-60 saturate-50' : ''}`}>
            <div className="flex gap-4 items-center">
                <div className="h-16 w-16 bg-slate-700 rounded-lg overflow-hidden shrink-0 shadow-lg relative">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />}
                    {item.isAvailable === false && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest rotate-[-20deg] border border-red-500/40 px-1 bg-black/50">86</span>
                        </div>
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${item.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            item.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                item.status === 'FLAGGED' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            }`}>
                            {item.status}
                        </span>
                        {item.isAvailable === false && (
                            <span className="text-[9px] px-2 py-0.5 font-black uppercase tracking-widest bg-red-600/15 text-red-400 border border-red-500/30 rounded-full">
                                86&apos;d
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 text-xs line-clamp-1 max-w-[200px] md:max-w-none">{item.description}</p>
                    {missingIngredients.length > 0 && (
                        <p className="text-[10px] text-red-400 font-bold mt-1 flex items-center gap-1">
                            <span className="text-xs">⚠️</span> Missing: {missingIngredients.join(', ')}
                        </p>
                    )}
                </div>

            </div>
            <div className="text-right">
                <div className="flex flex-col items-end">
                    {item.saleUntil && new Date(item.saleUntil) > new Date() ? (
                        <>
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 bg-emerald-500/10 px-2 py-0.5 rounded">Flash Sale</p>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 line-through text-sm font-bold">${Number(item.originalPrice || item.price * 1.15).toFixed(2)}</span>
                                <p className="font-bold text-2xl text-white">${Number(item.price).toFixed(2)}</p>
                            </div>
                        </>
                    ) : (
                        <p className="font-bold text-2xl">${Number(item.price).toFixed(2)}</p>
                    )}
                </div>

                <div className="flex flex-col items-end gap-1 mt-1">
                    <div className="flex gap-4 mt-1 items-center">
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleToggleStock}
                            disabled={isUpdating}
                            className={`font-black uppercase tracking-[0.15em] transition-all px-4 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                                item.isAvailable === false
                                ? 'text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                : 'text-[11px] bg-red-600/15 text-red-400 border-red-500/30 hover:bg-red-600/25 hover:border-red-500/50'
                            }`}
                        >
                            {isUpdating ? (
                                <span className="animate-pulse">…</span>
                            ) : item.isAvailable === false ? (
                                <>↩ Restock</>
                            ) : (
                                <><span className="text-[13px] leading-none font-black">86</span> It</>
                            )}
                        </button>
                    </div>

                    {item.status === 'FLAGGED' && (
                        <p className="text-[10px] text-orange-400 italic font-semibold mt-1">Review flagged content locally.</p>
                    )}
                </div>
            </div>

            {isEditing && (
                <EditItemModal item={item} onClose={() => setIsEditing(false)} />
            )}
        </div>
    );
}
