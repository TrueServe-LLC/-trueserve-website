
"use client";

import { useState } from "react";
import { scanMenuAction, confirmAIImport } from "../ai-actions";

export default function MenuScanner({ restaurantId }: { restaurantId: string }) {
    const [scanning, setScanning] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [message, setMessage] = useState("");

    const handleScan = async () => {
        setScanning(true);
        setMessage("TrueServe AI is parsing your menu...");

        // Mock base64 for demo
        const result = await scanMenuAction(restaurantId, "base64_demo_data");

        if (result.success && result.items) {
            setResults(result.items);
            setShowResults(true);
            setMessage("");
        } else {
            setMessage("Failed to scan menu: " + result.error);
        }
        setScanning(false);
    };

    const handleImport = async () => {
        setScanning(true);
        const res = await confirmAIImport(restaurantId, results);
        if (res.success) {
            setMessage("Menu successfully imported!");
            setTimeout(() => {
                setShowResults(false);
                setMessage("");
            }, 2000);
        } else {
            setMessage("Import failed: " + res.error);
        }
        setScanning(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowResults(!showResults)}
                className="btn btn-outline border-primary/30 text-primary hover:bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-widest flex items-center gap-2"
            >
                <span>✨</span> AI Menu Scan
            </button>

            {showResults && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-primary/10 to-transparent">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <span className="text-2xl">🪄</span> AI Extract Results
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">Review the items found by TrueServe AI</p>
                            </div>
                            <button onClick={() => setShowResults(false)} className="text-slate-500 hover:text-white">&times;</button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                            {results.length > 0 ? (
                                results.map((item, i) => (
                                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-white">{item.name}</p>
                                            <p className="text-xs text-slate-400">{item.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary">${item.price.toFixed(2)}</p>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">{item.category}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="text-4xl mb-4 animate-bounce">📸</div>
                                    <p className="text-slate-400">Upload a photo of your physical menu to begin.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-black/40 flex flex-col gap-4">
                            {message && (
                                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs text-center text-primary font-bold animate-pulse">
                                    {message}
                                </div>
                            )}

                            <div className="flex gap-4">
                                {results.length === 0 ? (
                                    <button
                                        onClick={handleScan}
                                        disabled={scanning}
                                        className="btn btn-primary flex-1 py-4 font-black uppercase text-xs tracking-widest disabled:opacity-50"
                                    >
                                        {scanning ? "Processing Image..." : "Start Scan"}
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={() => setResults([])} className="btn btn-ghost flex-1">Reset</button>
                                        <button
                                            onClick={handleImport}
                                            disabled={scanning}
                                            className="btn btn-primary flex-1 py-4 font-black uppercase text-xs tracking-widest disabled:opacity-50"
                                        >
                                            {scanning ? "Importing..." : "Confirm & Import All"}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
