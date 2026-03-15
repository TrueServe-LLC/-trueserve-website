"use client";

import { useState, useActionState } from "react";
import { updateMenuItem } from "../actions";

interface EditItemModalProps {
    item: any;
    onClose: () => void;
}

export default function EditItemModal({ item, onClose }: EditItemModalProps) {
    const [state, formAction, isPending] = useActionState(updateMenuItem, { message: "" });
    const [preview, setPreview] = useState(item.imageUrl);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    if (state.success) {
        onClose();
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-fade-in-up">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-black">Edit Item</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
                </div>

                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="currentImageUrl" value={item.imageUrl} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Item Name</label>
                                <input
                                    name="name"
                                    defaultValue={item.name}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                                    placeholder="Blueberry Pancakes"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Price ($)</label>
                                <input
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    defaultValue={item.price}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                                    placeholder="12.99"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Item Image</label>
                            <label className="group cursor-pointer relative block h-full min-h-[140px] rounded-3xl border border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all overflow-hidden text-center">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                        <span className="text-2xl mb-2">📸</span>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tap to replace</p>
                                    </div>
                                )}
                                <input type="file" name="image" className="hidden" onChange={handleImageChange} accept="image/*" />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Description</label>
                        <textarea
                            name="description"
                            defaultValue={item.description}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-medium h-32 resize-none"
                            placeholder="Describe your delicious creation..."
                        />
                    </div>

                    {state.message && (
                        <p className={`text-xs font-bold text-center ${state.error ? 'text-red-400' : 'text-emerald-400'}`}>
                            {state.message}
                        </p>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn btn-outline border-white/10 hover:bg-white/5 py-4 font-black uppercase tracking-widest text-xs h-14"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 btn btn-primary py-4 font-black uppercase tracking-widest text-xs h-14 shadow-lg shadow-primary/20"
                        >
                            {isPending ? "Saving..." : "Update Item"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
