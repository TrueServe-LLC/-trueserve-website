"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { useJsApiLoader } from '@react-google-maps/api';
import { MapPin } from "lucide-react";
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
    onAddressChange?: (hasValue: boolean) => void;
}

export default function LandingSearch({ locations = [], initialValue = "", isCompact = false, onAddressChange }: LandingSearchProps) {
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
        onAddressChange?.(val.trim().length > 0);

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

                        try {
                            localStorage.setItem("ts.delivery.address", address);
                            localStorage.setItem("ts.delivery.lat", String(lat));
                            localStorage.setItem("ts.delivery.lng", String(lng));
                        } catch { }

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
        try {
            const addressText = inputValue.trim();
            if (addressText) {
                localStorage.setItem("ts.delivery.address", addressText);
                localStorage.removeItem("ts.delivery.lat");
                localStorage.removeItem("ts.delivery.lng");
            }
        } catch { }
        router.push(`/restaurants?search=${encodeURIComponent(inputValue)}`);
    };

    if (!isLoaded) {
        return (
            <div className={`landing-search ${isCompact ? "landing-search-compact" : ""}`}>
                <form
                    onSubmit={handleManualSearch}
                    className="landing-search-form"
                >
                    <div className="landing-search-field">
                        <span
                            className="landing-search-icon"
                            aria-hidden="true"
                        >
                            <MapPin size={16} strokeWidth={2.2} />
                        </span>
                        <input
                            type="text"
                            placeholder="Enter delivery address..."
                            className="landing-search-input"
                            value={inputValue}
                            onChange={handleInput}
                        />
                    </div>

                    <button
                        type="submit"
                        className="landing-search-submit"
                    >
                        Find Food
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className={`landing-search animate-fade-in ${isCompact ? "landing-search-compact" : ""}`}>
            <div className="landing-search-glow"></div>

            <form
                onSubmit={handleManualSearch}
                className="landing-search-form"
            >
                <div className="landing-search-field">
                    <span
                        className="landing-search-icon"
                        aria-hidden="true"
                    >
                        <MapPin size={16} strokeWidth={2.2} />
                    </span>
                    <input
                        type="text"
                        placeholder="Enter delivery address..."
                        className="landing-search-input"
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

                <button
                    type="submit"
                    className="landing-search-submit"
                >
                    Find Food
                </button>
            </form>

            {isDropdownOpen && predictions.length > 0 && (
                <div className="landing-search-dropdown animate-fade-in-up">
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
