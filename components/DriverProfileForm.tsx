"use client";

import { useActionState } from "react";
import { updateDriverProfile } from "@/app/driver/actions";

export default function DriverProfileForm({ driver }: { driver: any }) {
    const [state, formAction, pending] = useActionState(updateDriverProfile, null);

    return (
        <form action={formAction} className="card bg-gradient-to-br from-white/5 to-transparent border-white/10 p-6 space-y-4">
            {state?.message && (
                <div className={`p-4 rounded-xl text-sm font-bold border ${state.error ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                    {state.message}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Profile Photo (Optional)</label>
                    <input
                        type="file"
                        name="photo"
                        accept="image/*"
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 text-slate-300 text-sm"
                    />
                    <p className="text-xs text-slate-500 mt-2">Upload a clear photo of yourself for customers.</p>
                </div>
            </div>

            <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">About Me (Optional)</label>
                <textarea
                    name="aboutMe"
                    defaultValue={driver.aboutMe || ""}
                    placeholder="Tell your customers a little about yourself, why you love driving, or your favorite food..."
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50"
                    rows={3}
                    maxLength={300}
                ></textarea>
            </div>

            <button type="submit" disabled={pending} className="btn bg-white/10 hover:bg-white/20 text-white shadow-lg border-none px-6 py-2.5">
                {pending ? "Saving..." : "Save Public Profile"}
            </button>
        </form>
    );
}
