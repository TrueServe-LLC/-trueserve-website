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
    const [fileName, setFileName] = useState("No file chosen");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
            setFileName(file.name);
        } else {
            setFileName("No file chosen");
        }
    };

    return (
        <div className="md-stat-block" style={{ marginBottom: "24px" }}>
            <div className="md-stat-name">Store Banner</div>

            {state.success && (
                <div style={{ marginBottom: "14px", padding: "10px 14px", background: "rgba(61,214,140,.1)", color: "var(--green)", borderRadius: "8px", fontSize: "13px", fontWeight: 600, border: "1px solid rgba(61,214,140,.2)" }}>
                    {state.message}
                </div>
            )}
            {state.error && (
                <div style={{ marginBottom: "14px", padding: "10px 14px", background: "rgba(226,75,74,.1)", color: "#f87171", borderRadius: "8px", fontSize: "13px", fontWeight: 600, border: "1px solid rgba(226,75,74,.2)" }}>
                    {state.message}
                </div>
            )}

            <form action={formAction}>
                <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 0, borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border)" }}>
                    <div style={{ position: "relative", minHeight: "240px", background: "var(--card2)", borderRight: "1px solid var(--border)" }}>
                        <img src={previewUrl} alt="Store Banner Preview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: "240px" }} />
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.14)", pointerEvents: "none" }} />
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                            <span style={{ background: "rgba(0,0,0,.35)", padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", color: "rgba(255,255,255,.6)" }}>Banner Preview</span>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "24px", background: "var(--card2)" }}>
                        <p style={{ color: "var(--t2)", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                            Recommended: 1200×800px · Max 5MB.<br />
                            This is the first image customers see when browsing your storefront.
                        </p>
                        <div style={{ overflow: "hidden", borderRadius: "8px", border: "1px solid var(--border)" }}>
                            <div style={{ display: "flex", alignItems: "stretch" }}>
                                <label style={{ cursor: "pointer", background: "var(--gold)", padding: "10px 18px", fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em", color: "#000", whiteSpace: "nowrap" }}>
                                    Choose File
                                    <input
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        required
                                        onChange={handleImageChange}
                                        style={{ display: "none" }}
                                    />
                                </label>
                                <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 14px", fontSize: "13px", color: "var(--t3)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {fileName}
                                </div>
                            </div>
                        </div>
                        <button type="submit" disabled={isPending} className="btn btn-gold" style={{ width: "fit-content" }}>
                            {isPending ? "Uploading..." : "Save Banner"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
