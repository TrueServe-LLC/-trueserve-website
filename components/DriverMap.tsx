"use client";

import { useMemo, useState } from "react";
import Map, { Source, Layer, Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Mock Hotzones
const HOTZONES = [
    { id: 'h1', name: "Uptown Surge", coords: [35.2271, -80.8431] as [number, number], color: '#ef4444', avgPay: 25, radius: 1200 },
    { id: 'h2', name: "South End", coords: [35.2136, -80.8596] as [number, number], color: '#f97316', avgPay: 18, radius: 1000 },
    { id: 'h3', name: "Plaza Midwood", coords: [35.2208, -80.8143] as [number, number], color: '#eab308', avgPay: 22, radius: 800 },
];

export default function DriverMap() {
    const [popupInfo, setPopupInfo] = useState<any>(null);

    // Create GeoJSON for Hotzones
    const hotzoneData = useMemo(() => {
        return {
            type: 'FeatureCollection',
            features: HOTZONES.map(zone => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [zone.coords[1], zone.coords[0]] // GeoJSON uses [lng, lat]
                },
                properties: {
                    id: zone.id,
                    name: zone.name,
                    color: zone.color,
                    radius: zone.radius,
                    avgPay: zone.avgPay
                }
            }))
        };
    }, []);

    if (!MAPBOX_TOKEN) {
        return <div className="h-[400px] w-full bg-slate-800 flex items-center justify-center text-slate-500">Mapbox Token Missing</div>;
    }

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg border border-white/10 relative z-0">
            {/* @ts-ignore */}
            <Map
                initialViewState={{
                    latitude: 35.2271,
                    longitude: -80.8431,
                    zoom: 12
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
            >
                <NavigationControl position="top-right" />

                {/* Render Circles using GeoJSON Layer (Approximate visualization using circle-radius) */}
                {/* Note: Mapbox GL JS 'circle' layer radius is in pixels by default unless usage 'pitch-alignment' map. 
                    For true geographic meters, Fill layer with detailed polygon is better, but Circle layer with zoom-dependent radius works for visual "heat".
                */}
                <Source id="hotzones" type="geojson" data={hotzoneData as any}>
                    <Layer
                        id="hotzone-layer"
                        type="circle"
                        paint={{
                            'circle-radius': [
                                'interpolate',
                                ['linear'],
                                ['zoom'],
                                10, ['/', ['get', 'radius'], 50], // simple scaling for demo
                                15, ['/', ['get', 'radius'], 10]
                            ],
                            'circle-color': ['get', 'color'],
                            'circle-opacity': 0.4,
                            'circle-stroke-width': 2,
                            'circle-stroke-color': ['get', 'color']
                        }}
                    />
                </Source>

                {/* Markers for Labels */}
                {HOTZONES.map(zone => (
                    <Marker
                        key={zone.id}
                        latitude={zone.coords[0]}
                        longitude={zone.coords[1]}
                        anchor="center"
                        onClick={e => {
                            e.originalEvent.stopPropagation();
                            setPopupInfo(zone);
                        }}
                    >
                        <div className="flex flex-col items-center cursor-pointer group">
                            <span className="text-xl drop-shadow-md group-hover:scale-125 transition-transform">🔥</span>
                        </div>
                    </Marker>
                ))}

                {popupInfo && (
                    <Popup
                        anchor="top"
                        longitude={popupInfo.coords[1]}
                        latitude={popupInfo.coords[0]}
                        onClose={() => setPopupInfo(null)}
                        className="text-black"
                    >
                        <div className="p-1 text-center">
                            <h3 className="font-bold text-slate-900">{popupInfo.name}</h3>
                            <p className="text-emerald-600 font-bold text-lg">${popupInfo.avgPay} <span className="text-xs text-slate-500 font-normal">/ order</span></p>
                            <p className="text-xs text-red-500 font-bold uppercase mt-1">Very Busy</p>
                        </div>
                    </Popup>
                )}
            </Map>

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
