"use client";

import { useState } from "react";

export default function DriverPreferences() {
    const [preferences, setPreferences] = useState({
        acceptAlcohol: true,
        acceptCash: false,
        longDistance: true,
        darkMode: true,
        navigationApp: "google",
    });

    const toggle = (key: keyof typeof preferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold">Preferences</h1>

            <section className="card bg-white/5 border-white/10 p-6 space-y-6">
                <h2 className="text-xl font-bold border-b border-white/10 pb-2">Delivery Settings</h2>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold">Alcohol Deliveries</p>
                        <p className="text-xs text-slate-400">Requires ID verification on drop-off.</p>
                    </div>
                    <button
                        onClick={() => toggle('acceptAlcohol')}
                        className={`w-12 h-6 rounded-full transition-colors relative ${preferences.acceptAlcohol ? 'bg-primary' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${preferences.acceptAlcohol ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold">Cash on Delivery</p>
                        <p className="text-xs text-slate-400">Collect cash from customers (kept as earnings).</p>
                    </div>
                    <button
                        onClick={() => toggle('acceptCash')}
                        className={`w-12 h-6 rounded-full transition-colors relative ${preferences.acceptCash ? 'bg-primary' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${preferences.acceptCash ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold">Long Distance Trips (8 mi)</p>
                        <p className="text-xs text-slate-400">Higher pay, more drive time.</p>
                    </div>
                    <button
                        onClick={() => toggle('longDistance')}
                        className={`w-12 h-6 rounded-full transition-colors relative ${preferences.longDistance ? 'bg-primary' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${preferences.longDistance ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
            </section>

            <section className="card bg-white/5 border-white/10 p-6 space-y-6">
                <h2 className="text-xl font-bold border-b border-white/10 pb-2">App Settings</h2>

                <div className="space-y-3">
                    <p className="font-semibold">Navigation App</p>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setPreferences(prev => ({ ...prev, navigationApp: 'google' }))}
                            className={`p-4 rounded-xl border flex items-center gap-2 justify-center transition-all ${preferences.navigationApp === 'google' ? 'bg-primary/20 border-primary text-primary font-bold' : 'bg-transparent border-white/10 hover:bg-white/5'}`}
                        >
                            <span>🗺️</span> Google Maps
                        </button>
                        <button
                            onClick={() => setPreferences(prev => ({ ...prev, navigationApp: 'waze' }))}
                            className={`p-4 rounded-xl border flex items-center gap-2 justify-center transition-all ${preferences.navigationApp === 'waze' ? 'bg-primary/20 border-primary text-primary font-bold' : 'bg-transparent border-white/10 hover:bg-white/5'}`}
                        >
                            <span>🚙</span> Waze
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold">Dark Mode</p>
                        <p className="text-xs text-slate-400">Always on for driver safety.</p>
                    </div>
                    <button
                        className={`w-12 h-6 rounded-full transition-colors relative bg-primary opacity-50 cursor-not-allowed`}
                        disabled
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white left-7`} />
                    </button>
                </div>
            </section>
        </div>
    );
}
