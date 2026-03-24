"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { useJsApiLoader } from '@react-google-maps/api';
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_SCRIPT_ID, GOOGLE_MAPS_API_KEY } from "@/lib/maps-config";

interface ServiceLocation {
    city: string;
    state: string;
    lat: number;
    lng: number;
}

interface LandingSearchProps {
    locations?: ServiceLocation[];
    initialValue?: string;
    isCompact?: boolean;
}

export default function LandingSearch({ locations = [], initialValue = "", isCompact = false }: LandingSearchProps) {
    const router = useRouter();
    const [inputValue, setInputValue] = useState(initialValue);
    const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Services
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const placesService = useRef<google.maps.places.PlacesService | null>(null);
    const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: GOOGLE_MAPS_SCRIPT_ID,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES
    });

    const initServices = () => {
        try {
            if (!autocompleteService.current && window.google) {
                autocompleteService.current = new window.google.maps.places.AutocompleteService();
                sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
                // Create a dummy element for PlacesService, as it requires an HTML element (or map)
                const dummyElement = document.createElement('div');
                placesService.current = new window.google.maps.places.PlacesService(dummyElement);
            }
        } catch (e) {
            console.error("Google Maps Services initialization failed:", e);
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        if (!val) {
            setPredictions([]);
            setIsDropdownOpen(false);
            return;
        }

        initServices();

        if (autocompleteService.current) {
            autocompleteService.current.getPlacePredictions({
                input: val,
                sessionToken: sessionToken.current || undefined,
            }, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    setPredictions(results);
                    setIsDropdownOpen(true);
                } else {
                    setPredictions([]);
                    setIsDropdownOpen(false);
                }
            });
        }
    };

    const handleSelectPrediction = (prediction: google.maps.places.AutocompletePrediction) => {
        setInputValue(prediction.description);
        setIsDropdownOpen(false);

        initServices();

        if (placesService.current && prediction.place_id) {
            try {
                placesService.current.getDetails({
                    placeId: prediction.place_id,
                    fields: ['geometry', 'formatted_address'],
                    sessionToken: sessionToken.current || undefined
                }, (place, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();
                        const address = place.formatted_address || prediction.description;

                        sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();

                        router.push(`/restaurants?lat=${lat}&lng=${lng}&address=${encodeURIComponent(address)}`);
                    } else {
                        console.warn("Places Details failed or missing geometry:", status);
                        router.push(`/restaurants?search=${encodeURIComponent(prediction.description)}`);
                    }
                });
            } catch (e) {
                console.error("Error in getDetails:", e);
                router.push(`/restaurants?search=${encodeURIComponent(prediction.description)}`);
            }
        } else {
            router.push(`/restaurants?search=${encodeURIComponent(prediction.description)}`);
        }
    };

    const handleManualSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/restaurants?search=${encodeURIComponent(inputValue)}`);
    };

    if (!isLoaded) {
        return <div className="h-12 w-full max-w-xl bg-slate-800 animate-pulse rounded-full"></div>;
    }

    return (
        <div className="w-full max-w-xl relative group z-50">
            <div className="absolute -inset-4 bg-primary/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-40 transition duration-1000"></div>

            <form onSubmit={handleManualSearch} className={`relative flex ${isCompact ? 'flex-row items-center' : 'flex-col sm:flex-row items-stretch sm:items-center'} bg-black/80 backdrop-blur-3xl border border-white/10 ${isCompact ? 'rounded-full p-1' : 'rounded-2xl sm:rounded-full p-2 sm:p-2.5'} gap-2 shadow-3xl z-20`}>
                <div className="flex items-center flex-1 px-4">
                    <span className={`pl-1 pr-3 ${isCompact ? 'text-lg' : 'text-xl md:text-2xl'} filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]`}>📍</span>
                    <input
                        type="text"
                        placeholder={isCompact ? "Search address or food..." : "Enter delivery address..."}
                        className={`flex-1 min-w-[50px] bg-transparent border-none focus:outline-none text-white placeholder:text-slate-700 px-2 font-black italic tracking-tight ${isCompact ? 'text-xs h-8' : 'text-sm md:text-xl h-10 md:h-14'}`}
                        value={inputValue}
                        onChange={handleInput}
                        onFocus={() => {
                            if (predictions.length > 0) setIsDropdownOpen(true);
                        }}
                        onBlur={() => {
                            setTimeout(() => setIsDropdownOpen(false), 200);
                        }}
                    />
                </div>

                <button type="submit" className={`badge-solid-primary ${isCompact ? 'rounded-full px-6 py-2 text-[10px] whitespace-nowrap' : 'rounded-full px-10 md:px-14 py-4 md:py-4.5 text-sm md:text-xl h-glow'} !bg-primary !text-black font-black hover:scale-[1.05] transition-all`}>
                    {isCompact ? 'Search' : 'Find Food'}
                </button>
            </form>

            {isDropdownOpen && predictions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10 animate-fade-in-up">
                    <ul className="max-h-60 overflow-y-auto">
                        {predictions.map((p) => (
                            <li
                                key={p.place_id}
                                className="px-4 py-3 hover:bg-white/10 cursor-pointer text-left border-b border-white/5 last:border-none transition-colors"
                                onMouseDown={() => handleSelectPrediction(p)}
                            >
                                <div className="font-bold text-white text-sm">{p.structured_formatting?.main_text || p.description}</div>
                                <div className="text-xs text-slate-400">{p.structured_formatting?.secondary_text || ""}</div>
                            </li>
                        ))}
                    </ul>
                    <div className="bg-black/50 px-2 py-1 flex justify-end">
                        <img src="https://developers.google.com/maps/documentation/images/powered_by_google_on_non_white.png" alt="Powered by Google" className="h-4 opacity-70" />
                    </div>
                </div>
            )}
        </div>
    );
}
