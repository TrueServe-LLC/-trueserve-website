"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '1rem'
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

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    // Handle updates to center or restaurants
    useEffect(() => {
        if (!map) return;

        if (restaurants.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            restaurants.forEach(r => bounds.extend({ lat: r.coords[0], lng: r.coords[1] }));
            // Also include the "center" (user search location) in the bounds so it's not off-screen
            bounds.extend({ lat: center[0], lng: center[1] });
            map.fitBounds(bounds);
        } else {
            // No restaurants, just pan to the search location
            map.panTo({ lat: center[0], lng: center[1] });
            map.setZoom(zoom);
        }
    }, [map, center, restaurants, zoom]);

    if (!isLoaded) {
        return <div className="h-[400px] w-full bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-500">Loading Google Maps...</div>;
    }

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        return (
            <div className="h-[400px] w-full bg-slate-800 rounded-xl flex items-center justify-center text-red-500 p-4 border border-red-500/20 text-center font-bold">
                Error: Missing Google Maps API Key
                <br />
                <span className="text-sm font-normal text-slate-400">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file</span>
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
                    disableDefaultUI: false,
                    zoomControl: true,
                    styles: [
                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                        {
                            featureType: "administrative.locality",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "poi",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "poi.park",
                            elementType: "geometry",
                            stylers: [{ color: "#263c3f" }],
                        },
                        {
                            featureType: "poi.park",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#6b9a76" }],
                        },
                        {
                            featureType: "road",
                            elementType: "geometry",
                            stylers: [{ color: "#38414e" }],
                        },
                        {
                            featureType: "road",
                            elementType: "geometry.stroke",
                            stylers: [{ color: "#212a37" }],
                        },
                        {
                            featureType: "road",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#9ca5b3" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "geometry",
                            stylers: [{ color: "#746855" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "geometry.stroke",
                            stylers: [{ color: "#1f2835" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#f3d19c" }],
                        },
                        {
                            featureType: "water",
                            elementType: "geometry",
                            stylers: [{ color: "#17263c" }],
                        },
                        {
                            featureType: "water",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#515c6d" }],
                        },
                        {
                            featureType: "water",
                            elementType: "labels.text.stroke",
                            stylers: [{ color: "#17263c" }],
                        },
                    ]
                }}
            >
                {/* User Location Marker */}
                <Marker
                    position={{ lat: center[0], lng: center[1] }}
                    title="Search Location"
                    icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    }}
                />

                {/* Restaurant Markers */}
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
