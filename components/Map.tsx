"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import dynamic from "next/dynamic";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

// Import RecenterMazp dynamically to avoid SSR issues with useMap
const RecenterMap = dynamic(() => import("./RecenterMap"), { ssr: false });

interface RestaurantLocation {
    id: string;
    name: string;
    coords: [number, number];
}

export default function Map({ center, zoom = 13, restaurants = [] }: {
    center: [number, number];
    zoom?: number;
    restaurants?: RestaurantLocation[];
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
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap center={center} />

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
