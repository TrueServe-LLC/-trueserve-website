
"use client";

import { useState } from "react";
import { generateApiKey } from "../actions";

interface POSIntegrationProps {
    currentApiKey?: string;
}

export default function POSIntegration({ currentApiKey }: POSIntegrationProps) {
    const [apiKey, setApiKey] = useState(currentApiKey || "");
    const [loading, setLoading] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (apiKey && !confirm("Generating a new key will immediately disable your old POS integration. Continue?")) return;

        setLoading(true);
        const res = await generateApiKey();
        if (res.success && res.apiKey) {
            setApiKey(res.apiKey);
            setShowKey(true);
        } else {
            alert("Failed to generate key: " + res.error);
        }
        setLoading(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="card bg-white/5 border-white/10 p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <span>🔌</span> POS Integration
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Connect systems like Toast, Square, or Deliverect</p>
                </div>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-black uppercase tracking-widest">Developer API</span>
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2 block">Your Secret API Key</label>

                    {apiKey ? (
                        <div className="flex gap-2">
                            <div className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-primary overflow-hidden relative group">
                                <span className={showKey ? "" : "blur-md select-none"}>
                                    {apiKey}
                                </span>
                                {!showKey && (
                                    <button
                                        onClick={() => setShowKey(true)}
                                        className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
                                    >
                                        Click to Reveal
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="btn btn-square bg-white/5 border-white/10 hover:bg-white/10 transition-all"
                                title="Copy Key"
                            >
                                {copied ? "✅" : "📋"}
                            </button>
                        </div>
                    ) : (
                        <div className="py-2">
                            <p className="text-sm text-slate-400 italic">No API key generated yet.</p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <p className="text-[10px] text-slate-500 max-w-md">
                        <strong>Security Note:</strong> Treat your API key like a password. Never share it or commit it to public code repositories.
                    </p>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="btn btn-outline border-white/20 text-white hover:bg-white/5 px-6 py-2 text-xs font-black uppercase tracking-widest whitespace-nowrap"
                    >
                        {loading ? "Generating..." : apiKey ? "Rotate Key" : "Generate Key"}
                    </button>
                </div>
            </div>
        </section>
    );
}
