"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, ImagePlus, Palette, UserCircle2, X } from "lucide-react";
import { updateAvatarDetails } from "@/app/user/settings/actions";
import { supabase } from "@/lib/supabase";

type ProfileAvatarProps = {
    userId: string;
    initialName: string;
    initialColor?: string;
    initialUrl?: string;
    className?: string;
};

const DEFAULT_COLOR = "#E8A230";
const COLOR_CLASS_TO_HEX: Record<string, string> = {
    "bg-primary/20": "#E8A230",
    "bg-orange-500": "#F97316",
    "bg-blue-500": "#3B82F6",
    "bg-green-500": "#22C55E",
    "bg-purple-500": "#A855F7",
    "bg-pink-500": "#EC4899",
    "bg-yellow-500": "#EAB308",
    "bg-indigo-500": "#6366F1",
};

const COLOR_OPTIONS = [
    "#E8A230",
    "#F97316",
    "#22C55E",
    "#0EA5E9",
    "#6366F1",
    "#EC4899",
    "#EF4444",
    "#334155",
];

const AVATAR_PRESETS = [
    { id: "sunrise", label: "Sunrise", url: "/avatars/customer-sunrise.svg", color: "#F59E0B" },
    { id: "spark", label: "Spark", url: "/avatars/customer-spark.svg", color: "#0EA5E9" },
    { id: "chef", label: "Chef", url: "/avatars/customer-chef.svg", color: "#22C55E" },
    { id: "hero", label: "Hero", url: "/avatars/customer-hero.svg", color: "#8B5CF6" },
    { id: "gold", label: "Gold", url: "/avatars/customer-gold.svg", color: "#E8A230" },
    { id: "night", label: "Night", url: "/avatars/customer-night.svg", color: "#334155" },
];

const normalizeColor = (value?: string) => {
    if (!value) return DEFAULT_COLOR;
    if (value.startsWith("#")) return value;
    return COLOR_CLASS_TO_HEX[value] || DEFAULT_COLOR;
};

const getInitials = (name: string) => {
    const chunks = name.trim().split(/\s+/).filter(Boolean);
    if (!chunks.length) return "U";
    if (chunks.length === 1) return chunks[0].slice(0, 1).toUpperCase();
    return `${chunks[0].slice(0, 1)}${chunks[chunks.length - 1].slice(0, 1)}`.toUpperCase();
};

export default function ProfileAvatar({
    userId,
    initialName,
    initialColor,
    initialUrl,
    className = "",
}: ProfileAvatarProps) {
    const router = useRouter();
    const [color, setColor] = useState(normalizeColor(initialColor));
    const [url, setUrl] = useState(initialUrl || "");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorText, setErrorText] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const wrapperSizeClass = className.trim() ? className : "h-16 w-16";
    const initials = getInitials(initialName);

    const saveAvatar = async (nextColor: string, nextUrl: string | null, closeMenu = false) => {
        setErrorText("");
        setIsSaving(true);
        const result = await updateAvatarDetails(userId, nextColor, nextUrl);
        setIsSaving(false);

        if (result?.error) {
            setErrorText(result.error);
            return;
        }

        if (closeMenu) setIsMenuOpen(false);
        router.refresh();
    };

    const handleColorPick = async (nextColor: string) => {
        setColor(nextColor);
        setUrl("");
        await saveAvatar(nextColor, null, true);
    };

    const handlePresetPick = async (preset: { color: string; url: string }) => {
        setColor(preset.color);
        setUrl(preset.url);
        await saveAvatar(preset.color, preset.url, true);
    };

    const handleUseMonogram = async () => {
        setUrl("");
        await saveAvatar(color, null, true);
    };

    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setErrorText("");

        const fileExt = file.name.split(".").pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;

        try {
            const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file);
            if (uploadError) throw uploadError;

            const {
                data: { publicUrl },
            } = supabase.storage.from("avatars").getPublicUrl(fileName);

            setUrl(publicUrl);
            await saveAvatar(color, publicUrl, true);
        } catch (error) {
            console.error("Error uploading avatar:", error);
            setErrorText("Failed to upload photo. Please try again.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
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
                onClick={() => setIsMenuOpen((prev) => !prev)}
                disabled={isUploading || isSaving}
                className="h-full w-full rounded-full flex items-center justify-center text-[clamp(1rem,2.5vw,2rem)] font-bold border border-white/15 transition-transform hover:scale-[1.02] overflow-hidden hover:ring-2 hover:ring-[#f97316]/40 relative group bg-[#151922] shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
                style={!url ? { backgroundColor: color, color: "#fff" } : undefined}
                aria-label="Customize avatar"
            >
                {url ? (
                    <img src={url} alt="Profile avatar" className="h-full w-full object-cover" />
                ) : (
                    !isUploading && !isSaving && <span>{initials}</span>
                )}

                {(isUploading || isSaving) && (
                    <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                )}

                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center backdrop-blur-sm transition-opacity">
                    <span className="text-[10px] text-white uppercase tracking-widest font-bold">Customize</span>
                </div>
            </button>

            {isMenuOpen && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-[min(92vw,420px)] max-h-[78vh] overflow-y-auto bg-[linear-gradient(180deg,rgba(21,24,32,0.97)_0%,rgba(12,14,19,0.98)_100%)] border border-white/10 rounded-3xl p-4 sm:p-5 shadow-[0_24px_70px_rgba(0,0,0,0.42)] z-50 animate-in fade-in slide-in-from-top-2"
                    style={{ top: "calc(100% + 12px)" }}
                >
                    <div className="mb-4">
                        <p className="text-[11px] text-white/60 font-extrabold uppercase tracking-[0.18em]">Customer Profile</p>
                        <h4 className="text-sm text-slate-100 font-bold uppercase tracking-[0.1em] mt-1">Avatar Customization</h4>
                        <p className="text-xs text-white/60 mt-1">Upload a photo or choose an avatar style.</p>
                    </div>

                    <div className="space-y-2 mb-4">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading || isSaving}
                            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left hover:border-[#f97316]/50 hover:bg-[#f97316]/10 transition-colors disabled:opacity-60"
                        >
                            <span className="flex items-center justify-between gap-3">
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white leading-none">
                                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f97316]/15 text-[#f97316]">
                                        <ImagePlus size={16} />
                                    </span>
                                    Upload Custom Photo
                                </span>
                                <span className="text-[11px] text-white/50">JPG, PNG, WEBP</span>
                            </span>
                        </button>

                        <button
                            onClick={handleUseMonogram}
                            disabled={!url || isUploading || isSaving}
                            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left hover:border-[#f97316]/50 hover:bg-[#f97316]/10 transition-colors disabled:opacity-60"
                        >
                            <span className="flex items-center justify-between gap-3">
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white leading-none">
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/90">
                                    <UserCircle2 size={16} />
                                </span>
                                Switch Back To Monogram
                                </span>
                                <span className="text-[11px] text-white/50">Initials + color</span>
                            </span>
                        </button>
                    </div>

                    <div className="mb-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55 mb-2">Choose Avatar</p>
                        <div className="grid grid-cols-3 gap-2">
                            {AVATAR_PRESETS.map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => handlePresetPick(preset)}
                                    disabled={isUploading || isSaving}
                                    className={`relative aspect-square overflow-hidden rounded-2xl border transition-all ${
                                        url === preset.url
                                            ? "border-[#f97316] ring-2 ring-[#f97316]/50"
                                            : "border-white/10 hover:border-white/30"
                                    }`}
                                    title={preset.label}
                                >
                                    <img src={preset.url} alt={preset.label} className="h-full w-full object-cover" />
                                    {url === preset.url && (
                                        <span className="absolute top-1 right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f97316] text-black">
                                            <Check size={12} strokeWidth={3} />
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55 mb-2">Monogram Color</p>
                        <div className="grid grid-cols-8 gap-2">
                            {COLOR_OPTIONS.map((swatch) => (
                                <button
                                    key={swatch}
                                    onClick={() => handleColorPick(swatch)}
                                    disabled={isUploading || isSaving}
                                    className={`h-8 w-8 rounded-full border transition-transform hover:scale-105 ${
                                        color === swatch && !url ? "border-white ring-2 ring-white/25" : "border-white/20"
                                    }`}
                                    style={{ backgroundColor: swatch }}
                                    title={swatch}
                                />
                            ))}
                        </div>
                    </div>

                    {errorText && (
                        <div className="mt-4 rounded-xl border border-red-400/35 bg-red-500/10 px-3 py-2 text-xs text-red-200 flex items-start gap-2">
                            <Camera size={14} className="mt-[2px] shrink-0" />
                            <span>{errorText}</span>
                        </div>
                    )}

                    <div className="mt-4 flex items-center justify-between text-xs text-white/50 border-t border-white/8 pt-3">
                        <span className="inline-flex items-center gap-2">
                            <Palette size={13} />
                            Personalized profile appearance
                        </span>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="inline-flex items-center gap-1 text-white/70 hover:text-white"
                        >
                            <X size={13} />
                            Close
                        </button>
                    </div>
                </div>
            )}

            {isMenuOpen && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsMenuOpen(false)} />}
        </div>
    );
}
