"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import dynamic from "next/dynamic";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false });

// Import RecenterMazp dynamically to avoid SSR issues with useMap
const RecenterMap = dynamic(() => import("./RecenterMap"), { ssr: false });

// Mock Hotzones (Customer Facing)
const POPULAR_ZONES = [
    { id: 'z1', name: "Uptown Dining", coords: [35.2271, -80.8431] as [number, number], color: '#eab308', radius: 1200 },
    { id: 'z2', name: "South End Eats", coords: [35.2136, -80.8596] as [number, number], color: '#f97316', radius: 1000 },
    { id: 'z3', name: "Plaza Midwood", coords: [35.2208, -80.8143] as [number, number], color: '#ef4444', radius: 800 },
];

interface RestaurantLocation {
    id: string;
    name: string;
    coords: [number, number];
}

export default function Map({ center, zoom = 13, restaurants = [], showHotspots = false }: {
    center: [number, number];
    zoom?: number;
    restaurants?: RestaurantLocation[];
    showHotspots?: boolean;
}) {
    const [leaflet, setLeaflet] = useState<any>(null);

    useEffect(() => {
        import("leaflet").then((L) => {
            setLeaflet(L);
            // @ts-ignore
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
                iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
            });
        });
    }, []);

    if (!leaflet) return <div className="h-[400px] w-full bg-slate-800 animate-pulse rounded-xl" />;

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg border border-white/10 relative z-0">
            {/* @ts-ignore */}
            <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="h-full w-full">
                {/* @ts-ignore */}
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <RecenterMap center={center} />

                {showHotspots && POPULAR_ZONES.map(zone => (
                    /* @ts-ignore */
                    <Circle key={zone.id} center={zone.coords} radius={zone.radius} pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.15 }}>
                        {/* @ts-ignore */}
                        <Popup>
                            <div className="p-1 text-center">
                                <h3 className="font-bold text-slate-900">{zone.name}</h3>
                                <p className="text-xs text-red-500 font-bold uppercase mt-1">Busy Area</p>
                            </div>
                        </Popup>
                    </Circle>
                ))}

                {/* User/Center Marker */}
                {/* @ts-ignore */}
                <Marker position={center}>
                    {/* @ts-ignore */}
                    <Popup>You are here</Popup>
                </Marker>

                {/* Restaurant Markers */}
                {restaurants.map(rest => (
                    /* @ts-ignore */
                    <Marker key={rest.id} position={rest.coords}>
                        {/* @ts-ignore */}
                        <Popup>
                            <div className="p-1">
                                <div className="font-bold text-slate-900">{rest.name}</div>
                                <Link href={`/restaurants/${rest.id}`} className="text-primary text-xs hover:underline">View Menu</Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
