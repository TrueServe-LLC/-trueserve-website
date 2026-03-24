"use client";

import { useState } from "react";
import { generateApiKey } from "../actions";

interface POSIntegrationProps {
    currentApiKey?: string;
    posType?: string;
}

export default function POSIntegration({ currentApiKey, posType = "None" }: POSIntegrationProps) {
    const [apiKey, setApiKey] = useState(currentApiKey || "");
    const [loading, setLoading] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);
    
    // External Integrations
    const [externalPos, setExternalPos] = useState(posType);
    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");

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
        <div className="space-y-12">
            {/* SECTION 1: SYSTEM HOOKS (TOAST/SQUARE) */}
            <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-3xl shadow-2xl">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🔌</span>
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">System Hooks</h3>
                        </div>
                        <p className="text-slate-500 text-sm font-bold italic">Synchronize your existing POS menus and orders.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest italic">Platform Selection</label>
                        <div className="grid grid-cols-2 gap-3">
                             {['Toast', 'Square', 'Clover', 'Revel', 'None'].map((sys) => (
                                 <button 
                                    key={sys}
                                    onClick={() => setExternalPos(sys)}
                                    className={`px-6 py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${externalPos === sys ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                 >
                                    {sys}
                                 </button>
                             ))}
                        </div>
                    </div>

                    {externalPos !== 'None' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">{externalPos} Client ID</label>
                                <input 
                                    type="text" 
                                    value={clientId} 
                                    onChange={(e) => setClientId(e.target.value)}
                                    placeholder="Enter ID..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary focus:outline-none font-mono"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">{externalPos} Client Secret</label>
                                <input 
                                    type="password" 
                                    value={clientSecret} 
                                    onChange={(e) => setClientSecret(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary focus:outline-none font-mono"
                                />
                            </div>
                            <button className="badge-solid-primary !py-4 !w-full !text-[10px] h-glow">
                                Sync {externalPos} System
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* SECTION 2: DEVELOPER API */}
            <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                     <span className="text-6xl italic font-black text-white">API</span>
                 </div>
                 
                 <div className="mb-10">
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Direct Hub Access</h3>
                    <p className="text-slate-500 text-sm font-bold italic">Integrate custom kiosks or 3rd party dispatchers.</p>
                </div>

                <div className="space-y-8 max-w-2xl">
                    <div className="p-8 bg-black/60 rounded-[2rem] border border-white/5 space-y-6">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-600 italic block">TrueServe Secret Key</label>

                        {apiKey ? (
                            <div className="flex gap-4">
                                <div className="flex-1 bg-black border border-white/10 rounded-xl px-6 py-4 font-mono text-sm text-primary overflow-hidden relative group">
                                    <span className={showKey ? "" : "blur-md select-none"}>
                                        {apiKey}
                                    </span>
                                    {!showKey && (
                                        <button
                                            onClick={() => setShowKey(true)}
                                            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/60 transition-colors text-[10px] font-black uppercase tracking-[0.3em] text-white"
                                        >
                                            Reveal Protocol Key
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all text-xl"
                                >
                                    {copied ? "✓" : "📋"}
                                </button>
                            </div>
                        ) : (
                            <div className="py-4 border-2 border-dashed border-white/10 rounded-2xl text-center">
                                <p className="text-slate-600 italic font-bold">No active protocol key generated.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-center justify-between pt-6">
                        <p className="text-[10px] text-slate-700 font-bold italic leading-relaxed max-w-sm">
                            Generate a new key to reset your connection. Existing kiosks must be updated immediately.
                        </p>
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="badge-outline-white !py-3 !px-10 !text-[10px]"
                        >
                            {loading ? "Rotating..." : apiKey ? "Rotate Protocol" : "Initialize API"}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
