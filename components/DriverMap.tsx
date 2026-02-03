"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false });

// Mock Hotzones
const HOTZONES = [
    { id: 'h1', name: "Uptown Surge", coords: [35.2271, -80.8431] as [number, number], color: '#ef4444', avgPay: 25, radius: 1200 },
    { id: 'h2', name: "South End", coords: [35.2136, -80.8596] as [number, number], color: '#f97316', avgPay: 18, radius: 1000 },
    { id: 'h3', name: "Plaza Midwood", coords: [35.2208, -80.8143] as [number, number], color: '#eab308', avgPay: 22, radius: 800 },
];

export default function DriverMap() {
    const [leaflet, setLeaflet] = useState<any>(null);
    const center: [number, number] = [35.2271, -80.8431]; // Charlotte

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
            <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full">
                {/* @ts-ignore */}
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {HOTZONES.map(zone => (
                    <div key={zone.id}>
                        {/* @ts-ignore */}
                        <Circle center={zone.coords} radius={zone.radius} pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.2 }} />
                        {/* @ts-ignore */}
                        <Marker position={zone.coords}>
                            {/* @ts-ignore */}
                            <Popup>
                                <div className="p-1 text-center">
                                    <h3 className="font-bold text-slate-900">{zone.name}</h3>
                                    <p className="text-emerald-600 font-bold text-lg">${zone.avgPay} <span className="text-xs text-slate-500 font-normal">/ order</span></p>
                                    <p className="text-xs text-red-500 font-bold uppercase mt-1">Very Busy</p>
                                </div>
                            </Popup>
                        </Marker>
                    </div>
                ))}
            </MapContainer>

            {/* Legend Overlay */}
            <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-white/10 z-[500]">
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
