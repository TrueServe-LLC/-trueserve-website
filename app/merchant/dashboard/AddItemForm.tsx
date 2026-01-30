"use client";

import { useActionState, useState } from "react";
import { addMenuItem } from "../actions";

const initialState = {
    message: "",
    success: false,
    error: false,
};

export default function AddItemForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(addMenuItem, initialState);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-primary text-sm"
            >
                + Add New Item
            </button>
        );
    }

    return (
        <div className="card p-6 border border-white/20 bg-slate-900/90 mb-8 animate-fade-in relative">
            <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
                ✕
            </button>

            <h3 className="text-xl font-bold mb-4">Add New Menu Item</h3>

            {state.success && (
                <div className="mb-4 p-3 bg-emerald-500/20 text-emerald-400 rounded text-sm">
                    {state.message}
                </div>
            )}

            <form action={formAction} className="space-y-4">
                <div className="grid grid-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Item Name</label>
                        <input name="name" type="text" required placeholder="e.g. Truffle Fries"
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Price ($)</label>
                        <input name="price" type="number" step="0.01" required placeholder="0.00"
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Description</label>
                    <textarea name="description" rows={2} placeholder="Brief description..."
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2" />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline text-sm py-2 px-4">
                        Cancel
                    </button>
                    <button type="submit" disabled={isPending} className="btn btn-primary text-sm py-2 px-4">
                        {isPending ? "Adding..." : "Save Item"}
                    </button>
                </div>
            </form>
        </div>
    );
}
