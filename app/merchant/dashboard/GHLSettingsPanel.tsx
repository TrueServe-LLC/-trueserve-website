"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function GHLSettingsPanel({ 
    restaurantId, 
    initialGhlUrl 
}: { 
    restaurantId: string, 
    initialGhlUrl?: string 
}) {
    const [ghlUrl, setGhlUrl] = useState(initialGhlUrl || "");
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");

    const saveGHL = async () => {
        setIsSaving(true);
        setMessage("");
        
        let urlToSave = ghlUrl.trim();
        
        // Extract just the src URL if they pasted the full iframe tag
        const srcMatch = urlToSave.match(/src=["']([^"']+)["']/);
        if (srcMatch) urlToSave = srcMatch[1];
        
        const { error } = await supabase
            .from('Restaurant')
            .update({ ghlUrl: urlToSave })
            .eq('id', restaurantId);

        if (error) {
            setMessage("❌ Failed to save GHL URL");
            console.error(error);
        } else {
            setGhlUrl(urlToSave);
            setMessage("✓ GHL embed saved — ordering will load automatically");
            setTimeout(() => setMessage(""), 3000);
        }
        setIsSaving(false);
    };

    return (
        <div className="md-stat-block" style={{ marginTop: '24px' }}>
            <div className="md-stat-name">GHL Integration</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '12px', color: 'var(--t2)' }}>
                    Paste your Go High Level (GHL) booking or ordering iframe URL (or the full embed code) here.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        value={ghlUrl}
                        onChange={(e) => setGhlUrl(e.target.value)}
                        placeholder="https://api.leadconnectorhq.com/widget/booking/..."
                        style={{
                            flex: 1,
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '10px 15px',
                            color: '#fff',
                            fontSize: '13px',
                            outline: 'none'
                        }}
                    />
                    <button 
                        onClick={saveGHL}
                        disabled={isSaving}
                        className="md-stripe-btn" 
                        style={{ padding: '0 20px', height: '40px', marginTop: 0 }}
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </button>
                </div>
                {message && <div style={{ fontSize: '11px', color: message.startsWith('✓') ? 'var(--green)' : 'var(--red)', fontWeight: 800 }}>{message}</div>}
            </div>
        </div>
    );
}
