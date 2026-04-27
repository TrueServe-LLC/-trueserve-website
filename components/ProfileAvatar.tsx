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
                <>
                    <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
                    <div className="fixed inset-x-3 top-4 bottom-4 z-50 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(21,24,32,0.98)_0%,rgba(10,12,17,0.99)_100%)] shadow-[0_24px_90px_rgba(0,0,0,0.52)] sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[min(680px,calc(100vw-40px))] sm:max-h-[88vh] sm:-translate-x-1/2 sm:-translate-y-1/2">
                        <div className="flex max-h-full flex-col">
                            <div className="border-b border-white/8 px-4 py-4 sm:px-6 sm:py-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/55">Customer Profile</p>
                                        <h4 className="mt-2 text-[30px] leading-none text-white font-black uppercase tracking-[0.06em] sm:text-[38px]">Avatar Customization</h4>
                                        <p className="mt-2 max-w-[520px] text-sm leading-6 text-white/65 sm:text-[15px]">
                                            Upload a custom photo, pick a preset avatar, or switch back to a monogram that matches the rest of your profile.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsMenuOpen(false)}
                                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                                        aria-label="Close avatar customization"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                                <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Current Look</p>
                                        <div className="mt-4 flex flex-col items-center text-center">
                                            <div
                                                className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#151922] text-4xl font-bold text-white shadow-[0_16px_40px_rgba(0,0,0,0.38)]"
                                                style={!url ? { backgroundColor: color } : undefined}
                                            >
                                                {url ? (
                                                    <img src={url} alt="Current avatar preview" className="h-full w-full object-cover" />
                                                ) : (
                                                    initials
                                                )}
                                            </div>
                                            <p className="mt-4 text-sm font-semibold text-white">{initialName || "Your profile"}</p>
                                            <p className="mt-1 text-xs leading-5 text-white/55">
                                                Photos work great for personal accounts. Monograms stay sharp across the full customer portal.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                                            <div className="mb-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Upload Or Reset</p>
                                            </div>
                                            <div className="space-y-3">
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={isUploading || isSaving}
                                                    className="w-full rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition-colors hover:border-[#f97316]/50 hover:bg-[#f97316]/10 disabled:opacity-60"
                                                >
                                                    <span className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                        <span className="inline-flex min-w-0 items-center gap-3 text-base font-semibold text-white">
                                                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f97316]/15 text-[#f97316]">
                                                                <ImagePlus size={18} />
                                                            </span>
                                                            <span className="leading-6">Upload Custom Photo</span>
                                                        </span>
                                                        <span className="text-xs uppercase tracking-[0.14em] text-white/45">JPG · PNG · WEBP</span>
                                                    </span>
                                                </button>

                                                <button
                                                    onClick={handleUseMonogram}
                                                    disabled={!url || isUploading || isSaving}
                                                    className="w-full rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition-colors hover:border-[#f97316]/50 hover:bg-[#f97316]/10 disabled:opacity-60"
                                                >
                                                    <span className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                        <span className="inline-flex min-w-0 items-center gap-3 text-base font-semibold text-white">
                                                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/90">
                                                                <UserCircle2 size={18} />
                                                            </span>
                                                            <span className="leading-6">Switch Back To Monogram</span>
                                                        </span>
                                                        <span className="text-xs uppercase tracking-[0.14em] text-white/45">Initials + color</span>
                                                    </span>
                                                </button>
                                            </div>
                                        </section>

                                        <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                                            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Choose Avatar</p>
                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                {AVATAR_PRESETS.map((preset) => (
                                                    <button
                                                        key={preset.id}
                                                        onClick={() => handlePresetPick(preset)}
                                                        disabled={isUploading || isSaving}
                                                        className={`group relative overflow-hidden rounded-[24px] border bg-[#0d1118] p-2 transition-all ${
                                                            url === preset.url
                                                                ? "border-[#f97316] ring-2 ring-[#f97316]/45"
                                                                : "border-white/10 hover:border-white/25"
                                                        }`}
                                                        title={preset.label}
                                                    >
                                                        <div className="overflow-hidden rounded-[20px]">
                                                            <img src={preset.url} alt={preset.label} className="aspect-square w-full object-cover transition-transform group-hover:scale-[1.02]" />
                                                        </div>
                                                        <div className="flex items-center justify-between px-1 pb-1 pt-3">
                                                            <span className="text-sm font-semibold text-white">{preset.label}</span>
                                                            {url === preset.url && (
                                                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f97316] text-black">
                                                                    <Check size={14} strokeWidth={3} />
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </section>

                                        <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                                            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Monogram Color</p>
                                            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                                                {COLOR_OPTIONS.map((swatch) => (
                                                    <button
                                                        key={swatch}
                                                        onClick={() => handleColorPick(swatch)}
                                                        disabled={isUploading || isSaving}
                                                        className={`flex h-12 w-full items-center justify-center rounded-full border transition-transform hover:scale-[1.03] ${
                                                            color === swatch && !url ? "border-white ring-2 ring-white/25" : "border-white/15"
                                                        }`}
                                                        style={{ backgroundColor: swatch }}
                                                        title={swatch}
                                                        aria-label={`Choose ${swatch} monogram color`}
                                                    />
                                                ))}
                                            </div>
                                        </section>
                                    </div>
                                </div>

                                {errorText && (
                                    <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                        <Camera size={16} className="mt-0.5 shrink-0" />
                                        <span>{errorText}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-white/8 px-4 py-4 sm:px-6">
                                <div className="flex flex-col gap-3 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="inline-flex items-center gap-2">
                                        <Palette size={14} />
                                        Personalized profile appearance across your customer account
                                    </span>
                                    <button
                                        onClick={() => setIsMenuOpen(false)}
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-white/75 transition hover:border-white/20 hover:text-white"
                                    >
                                        <X size={14} />
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
