"use client";

import { useState } from "react";
import { Copy, Check, Code, ExternalLink } from "lucide-react";

interface EmbedManagerProps {
    restaurantId: string;
    restaurantName: string;
}

export default function EmbedManager({ restaurantId, restaurantName }: EmbedManagerProps) {
    const [copied, setCopied] = useState(false);
    const [primaryColor, setPrimaryColor] = useState("10B981"); // Default Emerald
    
    const embedUrl = `https://trueserve-website.vercel.app/restaurants/${restaurantId}?embed=true&primary=${primaryColor.replace('#', '')}`;
    
    const snippet = `<div style="width:100%; overflow:hidden;">
  <iframe 
    src="${embedUrl}" 
    width="100%" 
    height="1000px" 
    frameborder="0" 
    style="border:none; border-radius:32px; box-shadow:0 20px 50px rgba(0,0,0,0.5);"
    allow="payment"
  ></iframe>
</div>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(snippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-8 bg-white/[0.03] border border-white/5 rounded-[2.5rem] space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-6xl opacity-5 group-hover:scale-110 transition-transform font-sans">🌐</div>
            
            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-white italic tracking-tight uppercase mb-2">GHL Integration Hub</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic leading-relaxed">Generated exclusively for the {restaurantName} terminal</p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Brand Accent:</label>
                    <input 
                        type="color" 
                        value={`#${primaryColor}`} 
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer"
                    />
                </div>
            </div>

            <div className="relative z-10 bg-black/40 border border-white/10 rounded-2xl p-6 font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed group-hover:border-emerald-500/30 transition-colors">
                {snippet}
            </div>

            <div className="relative z-10 flex gap-4">
                <button 
                    onClick={handleCopy}
                    className="flex-1 badge-solid-emerald py-4 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy GHL Snippet"}
                </button>
                <a 
                    href={embedUrl}
                    target="_blank"
                    className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white hover:bg-white/10 transition-all flex items-center gap-2 uppercase italic tracking-widest"
                >
                    <ExternalLink size={14} />
                    Preview Menu
                </a>
            </div>
        </div>
    );
}
