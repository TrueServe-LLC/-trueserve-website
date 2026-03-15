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
        <div key={item.id} className="card p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
            <div className="flex gap-4 items-center">
                <div className="h-16 w-16 bg-slate-700 rounded-lg overflow-hidden shrink-0 shadow-lg">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${item.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            item.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                item.status === 'FLAGGED' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            }`}>
                            {item.status}
                        </span>
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
                <p className="font-bold text-xl">${Number(item.price).toFixed(2)}</p>
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
                            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all px-3 py-1 rounded-lg border ${
                                item.isAvailable === false 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                                : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                            }`}
                        >
                            {isUpdating ? '...' : (item.isAvailable === false ? 'Restock' : 'Sold Out')}
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
