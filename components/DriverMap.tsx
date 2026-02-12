"use client";

import React, { useState, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker, Circle, InfoWindow } from '@react-google-maps/api';

import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_SCRIPT_ID, GOOGLE_MAPS_API_KEY } from "@/lib/maps-config";

// Mock Hotzones
const HOTZONES = [
    { id: 'h1', name: "Uptown Surge", coords: [35.2271, -80.8431] as [number, number], color: '#ef4444', avgPay: 25, radius: 1200 },
    { id: 'h2', name: "South End", coords: [35.2136, -80.8596] as [number, number], color: '#f97316', avgPay: 18, radius: 1000 },
    { id: 'h3', name: "Plaza Midwood", coords: [35.2208, -80.8143] as [number, number], color: '#eab308', avgPay: 22, radius: 800 },
];

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '1rem'
};

const center = {
    lat: 35.2271,
    lng: -80.8431
};

export default function DriverMap() {
    const { isLoaded } = useJsApiLoader({
        id: GOOGLE_MAPS_SCRIPT_ID,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES
    });

    const [selectedZone, setSelectedZone] = useState<any>(null);

    // Map Options
    const options = useMemo(() => ({
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
    }), []);

    if (!GOOGLE_MAPS_API_KEY) {
        return <div className="h-[400px] w-full bg-slate-800 flex items-center justify-center text-slate-500 rounded-xl border border-white/10">Google Maps API Key Missing</div>;
    }

    if (!isLoaded) {
        return <div className="h-[400px] w-full bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-500">Loading Map...</div>;
    }

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg border border-white/10 relative z-0">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={12}
                options={options}
            >
                {/* Hotzones Circles */}
                {HOTZONES.map(zone => (
                    <React.Fragment key={zone.id}>
                        <Circle
                            center={{ lat: zone.coords[0], lng: zone.coords[1] }}
                            radius={zone.radius}
                            options={{
                                fillColor: zone.color,
                                fillOpacity: 0.3,
                                strokeColor: zone.color,
                                strokeOpacity: 0.8,
                                strokeWeight: 2,
                                clickable: true
                            }}
                            onClick={() => setSelectedZone(zone)}
                        />
                        {/* Center Marker for Label/Click */}
                        <Marker
                            position={{ lat: zone.coords[0], lng: zone.coords[1] }}
                            label={{
                                text: "🔥",
                                fontSize: "20px",
                                className: "map-label-emoji"
                            }}
                            icon={{
                                path: window.google.maps.SymbolPath.CIRCLE,
                                scale: 0, // hidden marker, just label
                            }}
                            onClick={() => setSelectedZone(zone)}
                        />
                    </React.Fragment>
                ))}

                {/* Info Window */}
                {selectedZone && (
                    <InfoWindow
                        position={{ lat: selectedZone.coords[0], lng: selectedZone.coords[1] }}
                        onCloseClick={() => setSelectedZone(null)}
                    >
                        <div className="p-1 text-center text-black min-w-[150px]">
                            <h3 className="font-bold text-slate-900">{selectedZone.name}</h3>
                            <p className="text-emerald-600 font-bold text-lg">${selectedZone.avgPay} <span className="text-xs text-slate-500 font-normal">/ order</span></p>
                            <p className="text-xs text-red-500 font-bold uppercase mt-1">Very Busy</p>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>

            {/* Legend Overlay */}
            <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-white/10 z-[10]">
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Live Demand</h4>
                <div className="space-y-2">
                    {HOTZONES.map(zone => (
                        <div key={zone.id} className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }}></div>
                            <span className="text-white">{zone.name}: <span className="font-bold text-emerald-400">${zone.avgPay}</span></span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
