"use client";

import { useState, useRef, ChangeEvent } from "react";
import { updateAvatarDetails } from "@/app/user/settings/actions";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProfileAvatar({ 
    userId, 
    initialName, 
    initialColor, 
    initialUrl,
    className = ""
}: { 
    userId: string, 
    initialName: string, 
    initialColor?: string, 
    initialUrl?: string,
    className?: string
}) {
    const router = useRouter();
    const [color, setColor] = useState(initialColor || "bg-primary/20");
    const [url, setUrl] = useState(initialUrl || "");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const wrapperSizeClass = className?.trim() ? className : "h-16 w-16";

    const colors = [
        "bg-primary/20", "bg-orange-500", "bg-blue-500", 
        "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-yellow-500", "bg-indigo-500"
    ];

    const textColorClass = (c: string) => {
        if (c === "bg-primary/20") return "text-primary";
        return "text-white";
    };

    const handleColorPick = async (c: string) => {
        setColor(c);
        setUrl(""); // Clear URL if color is picked
        setIsMenuOpen(false);
        await updateAvatarDetails(userId, c, null);
        router.refresh();
    };

    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setIsMenuOpen(false);

        // Upload to Supabase bucket
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setUrl(publicUrl);
            await updateAvatarDetails(userId, color, publicUrl);
            router.refresh();
        } catch (error) {
            console.error("Error uploading avatar:", error);
            alert("Failed to upload photo. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={`relative inline-flex items-center justify-center ${wrapperSizeClass}`}>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileUpload} 
            />

            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                disabled={isUploading}
                className={`h-full w-full rounded-full flex items-center justify-center text-[clamp(1rem,2.5vw,2rem)] font-bold border transition-transform hover:scale-[1.02] overflow-hidden hover:ring-2 hover:ring-white/20 relative group
                    ${url ? 'border-white/20' : `${color} ${textColorClass(color)} border-white/10`}
                `}
                style={{
                    backgroundImage: url ? `url(${url})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {!url && !isUploading && (initialName?.[0] || "U").toUpperCase()}
                
                {isUploading && (
                    <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                )}

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center backdrop-blur-sm transition-opacity">
                    <span className="text-[10px] text-white uppercase tracking-widest font-bold">Edit</span>
                </div>
            </button>

            {isMenuOpen && (
                <div
                    className="absolute left-0 w-64 bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2"
                    style={{ top: "calc(100% + 12px)" }}
                >
                    <h4 className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Profile Icon</h4>
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 text-sm text-white flex items-center gap-2 transition-colors mb-3"
                    >
                        📸 Upload Custom Photo
                    </button>
                    
                    <div className="grid grid-cols-4 gap-2">
                        {colors.map(c => (
                            <button
                                key={c}
                                onClick={() => handleColorPick(c)}
                                className={`w-10 h-10 rounded-full ${c} border-2 hover:scale-110 transition-transform flex items-center justify-center
                                    ${color === c && !url ? 'border-white' : 'border-transparent'}
                                `}
                            />
                        ))}
                    </div>
                </div>
            )}
            
            {/* Backdrop to close menu */}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </div>
    );
}
