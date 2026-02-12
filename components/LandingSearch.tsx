"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

const libraries: ("places")[] = ["places"];

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
    const [searchResult, setSearchResult] = useState<google.maps.places.PlaceResult | null>(null);
    const [inputValue, setInputValue] = useState("");

    // Load Google Maps Script independently for this component if not already loaded by a parent
    // Note: If a parent component already loads the script (like in the main layout), this might be redundant but safe.
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries
    });

    const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
        setSearchResult(null); // Clear previous
    };

    const onPlaceChanged = () => {
        // This function would be called when the user selects a place
        // However, we need access to the autocomplete instance here, which is tricky with the wrapper.
        // A common pattern is to use a ref to store the autocomplete instance from onLoad.
    };

    // Better pattern for Autocomplete instance handling
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const handleLoad = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const handlePlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            setSearchResult(place);
            if (place.formatted_address) {
                setInputValue(place.formatted_address);
            }
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // If we have a selected place with geometry, we can pass lat/lng
        if (searchResult && searchResult.geometry && searchResult.geometry.location) {
            const lat = searchResult.geometry.location.lat();
            const lng = searchResult.geometry.location.lng();
            const address = searchResult.formatted_address || inputValue;
            router.push(`/restaurants?lat=${lat}&lng=${lng}&address=${encodeURIComponent(address)}`);
        } else {
            // Fallback: Just search by text query
            router.push(`/restaurants?search=${encodeURIComponent(inputValue)}`);
        }
    };

    if (!isLoaded) {
        return <div className="h-12 w-full max-w-xl bg-slate-800 animate-pulse rounded-full"></div>;
    }

    return (
        <form onSubmit={handleSearch} className="w-full max-w-xl relative group z-20">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-black border border-white/10 rounded-full p-2 pr-2 shadow-2xl">

                <span className="pl-4 pr-3 text-2xl">📍</span>

                <Autocomplete
                    onLoad={handleLoad}
                    onPlaceChanged={handlePlaceChanged}
                    className="flex-1"
                >
                    <input
                        type="text"
                        placeholder="Enter delivery address..."
                        className="w-full bg-transparent border-none focus:outline-none text-lg px-2 h-12 text-white placeholder-slate-500"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                </Autocomplete>

                <button type="submit" className="btn btn-primary rounded-full px-8 py-3 text-lg font-bold hover:scale-105 transition-transform">
                    Find Food
                </button>
            </div>
        </form>
    );
}
