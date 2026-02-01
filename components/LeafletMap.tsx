"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js/React
// Often the default icon paths are missing in bundlers
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapProps {
    center: [number, number];   // Leaflet uses [lat, lng]
    zoom?: number;
    restaurants?: Array<{
        id: string;
        name: string;
        coords: [number, number];
    }>;
}

// Sub-component to handle map updates, as useMap must be used inside MapContainer
function MapUpdater({ center, restaurants }: { center: [number, number], restaurants: MapProps['restaurants'] }) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        // 1. If we have restaurants, fit bounds to show all of them
        if (restaurants && restaurants.length > 0) {
            const group = L.latLngBounds(restaurants.map(r => r.coords));
            // Also include the search center in the view
            group.extend(center);
            map.fitBounds(group, { padding: [50, 50] });
        }
        // 2. If no restaurants, just pan to the city center
        else {
            map.setView(center, 13);
        }

    }, [map, center, restaurants]);

    return null;
}

export default function LeafletMap({ center, zoom = 13, restaurants = [] }: MapProps) {
    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg border border-white/10 relative z-0">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
            >
                {/* Dark Mode Map Tiles from CartoDB */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <MapUpdater center={center} restaurants={restaurants} />

                {/* User Location Marker */}
                <Marker position={center} icon={icon}>
                    <Popup>You are here (Search Location)</Popup>
                </Marker>

                {/* Restaurant Markers */}
                {restaurants.map((rest) => (
                    <Marker key={rest.id} position={rest.coords} icon={icon}>
                        <Popup>
                            <strong>{rest.name}</strong>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
