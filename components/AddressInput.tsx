"use client";

import { useState, useRef, useEffect } from "react";
import { useJsApiLoader } from '@react-google-maps/api';
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_SCRIPT_ID, GOOGLE_MAPS_API_KEY } from "@/lib/maps-config";

interface AddressInputProps {
    onAddressSelect: (address: string, lat: number, lng: number) => void;
    initialAddress?: string;
}

export default function AddressInput({ onAddressSelect, initialAddress = "" }: AddressInputProps) {
    const [inputValue, setInputValue] = useState(initialAddress);
    const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Sync input value with external prop changes
    useEffect(() => {
        if (initialAddress) {
            setInputValue(initialAddress);
        }
    }, [initialAddress]);

    // Services
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const placesService = useRef<google.maps.places.PlacesService | null>(null);
    const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: GOOGLE_MAPS_SCRIPT_ID,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES
    });

    useEffect(() => {
        if (isLoaded && !autocompleteService.current && window.google) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
            sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
            const dummyElement = document.createElement('div');
            placesService.current = new window.google.maps.places.PlacesService(dummyElement);
        }
    }, [isLoaded]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        if (!val) {
            setPredictions([]);
            setIsDropdownOpen(false);
            return;
        }

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

        if (placesService.current) {
            placesService.current.getDetails({
                placeId: prediction.place_id,
                fields: ['geometry', 'formatted_address'],
                sessionToken: sessionToken.current || undefined
            }, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    const address = place.formatted_address || prediction.description;

                    // Reset session token
                    sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();

                    onAddressSelect(address, lat, lng);
                }
            });
        }
    };

    if (!isLoaded) {
        return <div className="h-10 w-full bg-slate-800 animate-pulse rounded-lg"></div>;
    }

    return (
        <div className="relative w-full z-40">
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl focus-within:border-primary/50 transition-all overflow-hidden">
                <div className="shrink-0 pl-4 pr-2 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Enter delivery address..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder:text-slate-500 py-4 text-sm font-bold pr-4"
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

            {isDropdownOpen && predictions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                    {predictions.map((p) => (
                        <div
                            key={p.place_id}
                            className="px-4 py-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-none transition-colors"
                            onMouseDown={() => handleSelectPrediction(p)}
                        >
                            <div className="font-bold text-white text-sm">{p.structured_formatting.main_text}</div>
                            <div className="text-xs text-slate-400">{p.structured_formatting.secondary_text}</div>
                        </div>
                    ))}
                    <div className="bg-black/50 px-2 py-1 flex justify-end">
                        <img src="https://developers.google.com/maps/documentation/images/powered_by_google_on_non_white.png" alt="Powered by Google" className="h-4 opacity-70" />
                    </div>
                </div>
            )}
        </div>
    );
}
