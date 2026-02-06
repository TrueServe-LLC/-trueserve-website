"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import Link from "next/link";

export interface SearchLocation {
    city: string;
    state: string;
    lat?: number;
    lng?: number;
}

export default function LandingSearch({ locations }: { locations: SearchLocation[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleNearMe = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition((position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            // Find nearest location
            let nearest = null;
            let minDistance = Infinity;

            for (const loc of locations) {
                if (!loc.lat || !loc.lng) continue;

                // Simple Euclidean distance is sufficient for "nearest city" logic at this scale
                // (or use Haversine if we want precision, but this is a pilot)
                const dist = Math.sqrt(Math.pow(userLat - loc.lat, 2) + Math.pow(userLng - loc.lng, 2));

                if (dist < minDistance) {
                    minDistance = dist;
                    nearest = loc;
                }
            }

            // Threshold: approx 5 degrees (~350 miles) to ignore "User in Tokyo searching for Charlotte"
            if (nearest && minDistance < 5.0) {
                const locString = `${nearest.city}, ${nearest.state}`;
                setInputValue(locString);
                // Optional: Auto-submit?
                // router.push(`/restaurants?location=${encodeURIComponent(locString)}`); 
                // Better UX: Just fill it and let them click "Find Food" or hit enter, 
                // so they verify the detected location.
                if (inputRef.current) inputRef.current.focus();
            } else {
                alert("We couldn't find a supported service area near your current location.");
            }
            setLoading(false);

        }, (error) => {
            console.error("Geo Error:", error);
            alert("Unable to retrieve your location. Please type manually.");
            setLoading(false);
        });
    };

    return (
        <form action="/restaurants" className="w-full max-w-xl relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-black border border-white/10 rounded-full p-2 pr-2 shadow-2xl">

                {/* Location Pin / Loading Spinner */}
                <button
                    type="button"
                    onClick={handleNearMe}
                    disabled={loading}
                    className="pl-4 pr-3 text-2xl hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Find food near me"
                >
                    {loading ? <span className="loading loading-spinner loading-xs"></span> : '📍'}
                </button>

                <input
                    ref={inputRef}
                    name="location"
                    required
                    list="supportedSources"
                    placeholder="Enter delivery address (e.g. Pineville, NC)"
                    className="flex-1 bg-transparent border-none focus:outline-none text-lg px-2 h-12 text-white placeholder-slate-500"
                    autoComplete="off"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />

                {/* Autocomplete Datalist */}
                <datalist id="supportedSources">
                    {locations.map((loc, idx) => (
                        <option key={idx} value={`${loc.city}, ${loc.state}`} />
                    ))}
                </datalist>

                <button type="submit" className="btn btn-primary rounded-full px-8 py-3 text-lg font-bold hover:scale-105 transition-transform">
                    Find Food
                </button>
            </div>

            {/* Quick Links / Suggestions */}
            <div className="mt-4 flex gap-2 justify-center text-sm text-slate-500">
                <span>Popular:</span>
                {locations.slice(0, 3).map((loc, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setInputValue(`${loc.city}, ${loc.state}`)}
                        className="text-slate-400 hover:text-white underline"
                    >
                        {loc.city}
                    </button>
                ))}
            </div>
        </form>
    );
}
