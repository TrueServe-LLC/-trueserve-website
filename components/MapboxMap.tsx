"use client";

import React, { useRef, useState, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, ScaleControl, GeolocateControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import Link from 'next/link';

// You need to add your Mapbox token to .env as NEXT_PUBLIC_MAPBOX_TOKEN
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface RestaurantLocation {
    id: string;
    name: string;
    coords: [number, number]; // [lat, lng]
    image?: string;
    rating?: number;
    tags?: string[];
}

interface MapProps {
    center: [number, number];
    zoom?: number;
    restaurants?: RestaurantLocation[];
}

export default function MapboxMap({ center, zoom = 13, restaurants = [] }: MapProps) {
    const [popupInfo, setPopupInfo] = useState<RestaurantLocation | null>(null);

    // Initial View Store
    const initialViewState = useMemo(() => ({
        latitude: center[0],
        longitude: center[1],
        zoom: zoom
    }), [center, zoom]);

    // Markers
    const markers = useMemo(() => restaurants.map((rest) => (
        <Marker
            key={rest.id}
            latitude={rest.coords[0]}
            longitude={rest.coords[1]}
            anchor="bottom"
            onClick={(e) => {
                // If we let the click propagate to the map, it will immediately close the popup
                e.originalEvent.stopPropagation();
                setPopupInfo(rest);
            }}
        >
            <div className="cursor-pointer text-2xl drop-shadow-md hover:scale-125 transition-transform" role="img" aria-label="marker">
                📍
            </div>
        </Marker>
    )), [restaurants]);

    if (!MAPBOX_TOKEN) {
        return (
            <div className="h-full w-full bg-slate-900 flex items-center justify-center text-red-400 p-6 text-center border border-red-500/20 rounded-xl">
                <div>
                    <h3 className="font-bold text-lg mb-2">Mapbox Token Missing</h3>
                    <p className="text-sm text-slate-400">
                        Please add <code className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">NEXT_PUBLIC_MAPBOX_TOKEN</code> to your .env file.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Map
            initialViewState={initialViewState}
            style={{ width: '100%', height: '100%', borderRadius: '1rem' }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
        >
            <GeolocateControl position="top-left" />
            <FullscreenControl position="top-left" />
            <NavigationControl position="top-left" />
            <ScaleControl />

            {markers}

            {popupInfo && (
                <Popup
                    anchor="top"
                    longitude={popupInfo.coords[1]}
                    latitude={popupInfo.coords[0]}
                    onClose={() => setPopupInfo(null)}
                    closeOnClick={false}
                    className="text-black"
                >
                    <div className="min-w-[200px]">
                        {popupInfo.image && (
                            <img src={popupInfo.image} alt={popupInfo.name} className="w-full h-24 object-cover rounded-t-lg mb-2" />
                        )}
                        <div className="p-2">
                            <h3 className="font-bold text-base mb-1">{popupInfo.name}</h3>
                            {popupInfo.rating && (
                                <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                                    <span className="text-yellow-500">★</span> {popupInfo.rating}
                                </div>
                            )}
                            <Link href={`/restaurants/${popupInfo.id}`} className="block w-full text-center bg-primary text-black text-xs font-bold py-1.5 rounded mt-2 hover:opacity-90">
                                View Menu
                            </Link>
                        </div>
                    </div>
                </Popup>
            )}
        </Map>
    );
}
