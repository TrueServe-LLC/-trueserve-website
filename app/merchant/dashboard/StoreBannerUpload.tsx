"use client";

import { useActionState, useState } from "react";
import { updateStoreBanner, MerchantActionState } from "../actions";

const initialState: MerchantActionState = {
    message: "",
    success: false,
    error: false,
};

export default function StoreBannerUpload({ currentImageUrl }: { currentImageUrl: string }) {
    const [state, formAction, isPending] = useActionState(updateStoreBanner, initialState);
    const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '/restaurant1.jpg');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    return (
        <div className="card p-6 border border-white/20 bg-slate-900/90 mb-8 w-full md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Store Banner</h3>

            {state.success && (
                <div className="mb-4 p-3 bg-emerald-500/20 text-emerald-400 rounded text-sm">
                    {state.message}
                </div>
            )}

            {state.error && (
                <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded text-sm">
                    {state.message}
                </div>
            )}

            <form action={formAction} className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-1/3 aspect-video bg-black/50 rounded-lg overflow-hidden border border-white/10 shrink-0">
                    <img src={previewUrl} alt="Store Banner Preview" className="w-full h-full object-cover" />
                </div>

                <div className="flex flex-col gap-4 w-full">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Upload New Banner</label>
                        <input
                            name="image"
                            type="file"
                            accept="image/*"
                            required
                            onChange={handleImageChange}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                        />
                        <p className="text-xs text-slate-500 mt-2">Recommended size: 1200x800px. Max size: 5MB. This will be the main image customers see when browsing restaurants.</p>
                    </div>

                    <button type="submit" disabled={isPending} className="btn bg-primary text-black font-bold text-sm py-2 px-6 self-start rounded-full uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        {isPending ? "Uploading..." : "Save Banner"}
                    </button>
                </div>
            </form>
        </div>
    );
}
