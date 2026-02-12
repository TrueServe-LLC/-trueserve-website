"use client";

import React, { useState } from 'react';
import LandingSearch from '@/components/LandingSearch';
import MapWithDirections from '@/components/MapWithDirections';

export default function TestMapsPage() {
    const [origin, setOrigin] = useState("Charlotte, NC");
    const [destination, setDestination] = useState("Pineville, NC");

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-8">Google Maps Integration Test</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. Places API Section */}
                <div className="space-y-4 border border-white/10 p-6 rounded-2xl bg-white/5">
                    <h2 className="text-xl font-semibold text-primary">1. Places API (Autocomplete)</h2>
                    <p className="text-slate-400 text-sm">
                        Uses <code>LandingSearch.tsx</code> component. Type an address below to see the autocomplete in action.
                    </p>
                    <div className="p-4 bg-black/50 rounded-xl relative z-20">
                        <LandingSearch />
                    </div>
                </div>

                {/* 2. Directions API Section */}
                <div className="space-y-4 border border-white/10 p-6 rounded-2xl bg-white/5">
                    <h2 className="text-xl font-semibold text-primary">2. Directions API</h2>
                    <p className="text-slate-400 text-sm">
                        Uses <code>MapWithDirections.tsx</code> component.
                        Calculates route between Origin and Destination.
                    </p>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs uppercase font-bold text-slate-500">Origin</label>
                            <input
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                className="w-full bg-slate-800 border-none rounded p-2 text-sm mt-1"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs uppercase font-bold text-slate-500">Destination</label>
                            <input
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="w-full bg-slate-800 border-none rounded p-2 text-sm mt-1"
                            />
                        </div>
                    </div>

                    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-white/10 relative z-0">
                        {/* Force re-render on change simply for demo purposes */}
                        <MapWithDirections
                            origin={origin}
                            destination={destination}
                        />
                    </div>
                </div>

                {/* 3. Maps JavaScript API (Basic Map) */}
                <div className="space-y-4 border border-white/10 p-6 rounded-2xl bg-white/5">
                    <h2 className="text-xl font-semibold text-primary">3. Maps JavaScript API</h2>
                    <p className="text-slate-400 text-sm">
                        Basic map rendering. See <code>components/GoogleMapsMap.tsx</code>.
                    </p>
                    {/* We can re-use the directions map or import the basic one. 
                         Let's just note it's covered by the others. */}
                    <div className="h-40 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                        (See Landing Page for Interactive Instance)
                    </div>
                </div>

                {/* 4. Google OAuth */}
                <div className="space-y-4 border border-white/10 p-6 rounded-2xl bg-white/5">
                    <h2 className="text-xl font-semibold text-primary">4. Google OAuth</h2>
                    <p className="text-slate-400 text-sm">
                        Integrated via Supabase. Code is in <code>app/login/page.tsx</code>.
                    </p>
                    <a href="/login" className="btn btn-primary btn-sm">
                        Test Login Flow &rarr;
                    </a>
                </div>

            </div>
        </div>
    );
}
