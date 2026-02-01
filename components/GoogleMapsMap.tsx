"use client";

import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '1rem'
};

const defaultCenter = {
    lat: 35.2271,
    lng: -80.8431
};

interface RestaurantLocation {
    id: string;
    name: string;
    coords: [number, number]; // [lat, lng]
}

interface MapProps {
    center: [number, number];
    zoom?: number;
    restaurants?: RestaurantLocation[];
}

function GoogleMapsMap({ center, zoom = 13, restaurants = [] }: MapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        const bounds = new window.google.maps.LatLngBounds();
        // Fit bounds to center + restaurants? Or just use center/zoom
        // If we have restaurants, let's fit bounds
        if (restaurants.length > 0) {
            restaurants.forEach(r => bounds.extend({ lat: r.coords[0], lng: r.coords[1] }));
            map.fitBounds(bounds);
        } else {
            map.setCenter({ lat: center[0], lng: center[1] });
            map.setZoom(zoom);
        }

        setMap(map);
    }, [restaurants, center, zoom]);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    if (!isLoaded) {
        return <div className="h-[400px] w-full bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-500">Loading Google Maps...</div>;
    }

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        return (
            <div className="h-[400px] w-full bg-slate-800 rounded-xl flex items-center justify-center text-red-400 p-4 border border-red-500/20 text-center">
                <p>Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env<br /><span className="text-xs text-slate-500">Please add your API key to view the map.</span></p>
            </div>
        );
    }

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg border border-white/10 relative z-0">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={{ lat: center[0], lng: center[1] }}
                zoom={zoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    styles: [
                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                        // ... Dark mode styles
                    ]
                }}
            >
                {/* Child components, such as markers, info windows, etc. */}
                <Marker position={{ lat: center[0], lng: center[1] }} title="You are here" />

                {restaurants.map(rest => (
                    <Marker
                        key={rest.id}
                        position={{ lat: rest.coords[0], lng: rest.coords[1] }}
                        title={rest.name}
                    />
                ))}
            </GoogleMap>
        </div>
    );
}

export default React.memo(GoogleMapsMap);
