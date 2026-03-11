"use client";

import { useState } from "react";
import { updateProfileName } from "@/app/user/settings/actions";

export default function ProfileNameEditor({ userId, initialName }: { userId: string, initialName: string }) {
    const [name, setName] = useState(initialName || "");
    const [isEditing, setIsEditing] = useState(!initialName || initialName === "User");
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) return;
        setIsLoading(true);
        await updateProfileName(userId, name.trim());
        setIsEditing(false);
        setIsLoading(false);
    };

    if (!isEditing) {
        return (
            <div className="flex items-center gap-3">
                <h2 className="font-bold text-white text-lg">{name}</h2>
                <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-white text-xs underline">
                    Edit
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your name"
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-primary w-40"
                autoFocus
            />
            <button 
                onClick={handleSave} 
                disabled={isLoading || !name.trim()}
                className="bg-primary text-black px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-50"
            >
                {isLoading ? "..." : "Save"}
            </button>
        </div>
    );
}
