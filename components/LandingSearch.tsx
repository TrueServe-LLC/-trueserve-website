"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_SCRIPT_ID, GOOGLE_MAPS_API_KEY } from "@/lib/maps-config";

interface ServiceLocation {
    city: string;
    state: string;
    lat: number;
    lng: number;
}

interface LandingSearchProps {
    locations?: ServiceLocation[];
}

export default function LandingSearch({ locations = [] }: LandingSearchProps) {
    const router = useRouter();
    const [inputValue, setInputValue] = useState("");
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

    // Initialize services
    const initServices = () => {
        if (!autocompleteService.current && window.google) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
            sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
            // Create a dummy element for PlacesService, as it requires an HTML element (or map)
            const dummyElement = document.createElement('div');
            placesService.current = new window.google.maps.places.PlacesService(dummyElement);
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
                types: ['address', 'establishment'] // broadly match
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

        if (placesService.current) {
            // Need to get details to get Lat/Lng
            placesService.current.getDetails({
                placeId: prediction.place_id,
                fields: ['geometry', 'formatted_address'],
                sessionToken: sessionToken.current || undefined
            }, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    const address = place.formatted_address || prediction.description;

                    // Reset session token after successful selection
                    sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();

                    router.push(`/restaurants?lat=${lat}&lng=${lng}&address=${encodeURIComponent(address)}`);
                } else {
                    // Fallback to text search if details fail
                    router.push(`/restaurants?search=${encodeURIComponent(prediction.description)}`);
                }
            });
        }
    };

    const handleManualSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // If they just hit enter without selecting
        router.push(`/restaurants?search=${encodeURIComponent(inputValue)}`);
    };

    if (!isLoaded) {
        return <div className="h-12 w-full max-w-xl bg-slate-800 animate-pulse rounded-full"></div>;
    }

    return (
        <div className="w-full max-w-xl relative group z-50">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

            <form onSubmit={handleManualSearch} className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-black border border-white/10 rounded-[2rem] sm:rounded-full p-2 gap-2 shadow-2xl z-20">
                <div className="flex items-center flex-1 px-2">
                    <span className="pl-2 pr-2 text-2xl">📍</span>
                    <input
                        type="text"
                        placeholder="Enter delivery address..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-base sm:text-lg px-2 h-12 text-white placeholder-slate-500"
                        value={inputValue}
                        onChange={handleInput}
                        onFocus={() => {
                            if (predictions.length > 0) setIsDropdownOpen(true);
                        }}
                        onBlur={() => {
                            // Delay closing to allow click
                            setTimeout(() => setIsDropdownOpen(false), 200);
                        }}
                    />
                </div>

                <button type="submit" className="btn btn-primary rounded-2xl sm:rounded-full px-8 py-4 sm:py-3 text-lg font-black hover:scale-[1.02] sm:hover:scale-105 transition-all">
                    Find Food
                </button>
            </form>

            {/* Custom Dropdown */}
            {isDropdownOpen && predictions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10 animate-fade-in-up">
                    <ul className="max-h-60 overflow-y-auto">
                        {predictions.map((p) => (
                            <li
                                key={p.place_id}
                                className="px-4 py-3 hover:bg-white/10 cursor-pointer text-left border-b border-white/5 last:border-none transition-colors"
                                onMouseDown={() => handleSelectPrediction(p)} // Use onMouseDown to fire before input blur
                            >
                                <div className="font-bold text-white text-sm">{p.structured_formatting.main_text}</div>
                                <div className="text-xs text-slate-400">{p.structured_formatting.secondary_text}</div>
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
