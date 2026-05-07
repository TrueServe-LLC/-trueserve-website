"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { createClient } from "@/lib/supabase/client";
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_SCRIPT_ID, GOOGLE_MAPS_API_KEY } from "@/lib/maps-config";
import { getAIPredictedHeatmap } from "@/app/driver/actions";

// Dark Mode Map Style
const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#212121" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
    { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
    { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
    { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
    { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
    { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
    { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
];

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '1rem'
};

type LatLng = { lat: number; lng: number; };
type HeatPoint = { lat: number; lng: number; weight: number; };

// Orange → Red gradient matching TrueServe brand — 6 stops for deck.gl HeatmapLayer
const HEATMAP_COLOR_RANGE: [number, number, number, number][] = [
    [255, 153, 42, 0],    // transparent (no activity)
    [255, 173, 82, 80],   // soft gold (low demand)
    [249, 115, 22, 160],  // brand orange (moderate)
    [249, 115, 22, 210],  // strong orange
    [239, 68, 68, 235],   // hot red (high demand)
    [185, 28, 28, 255],   // deep red core (peak)
];

export default function DriverMap({
    initialCenter,
    className = "h-[400px] w-full"
}: {
    initialCenter?: LatLng | null;
    className?: string;
}) {
    const [mapCenter, setMapCenter] = useState<LatLng | null>(initialCenter || null);
    const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([]);
    const [lastUpdate, setLastUpdate] = useState<string>("Loading...");
    const deckOverlayRef = useRef<GoogleMapsOverlay | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: GOOGLE_MAPS_SCRIPT_ID,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES,
    });

    // Geolocation
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => console.log("Geolocation unavailable. Continuing with stored driver coordinates.")
            );
        }
    }, [initialCenter]);

    // Fetch initial heatmap data + subscribe to live orders
    useEffect(() => {
        if (!isLoaded) return;
        const supabase = createClient();

        const fetchData = async () => {
            const predictedPoints = await getAIPredictedHeatmap();
            setHeatPoints(predictedPoints);
            setLastUpdate(new Date().toLocaleTimeString());
        };

        fetchData();

        const channel = supabase
            .channel('realtime-orders')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Order' }, async (payload: any) => {
                console.log('New Order! Updating Heatmap...', payload);
                const newOrder = payload.new as any;
                if (newOrder.restaurantId) {
                    const { data: rest } = await supabase
                        .from('Restaurant')
                        .select('lat, lng')
                        .eq('id', newOrder.restaurantId)
                        .single();
                    if (rest) {
                        setHeatPoints(prev => [
                            ...prev,
                            { lat: rest.lat, lng: rest.lng, weight: newOrder.total || 25 }
                        ]);
                        setLastUpdate(new Date().toLocaleTimeString());
                    }
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [isLoaded]);

    // Push updated heatmap data into the deck.gl overlay whenever heatPoints changes
    useEffect(() => {
        if (!deckOverlayRef.current || heatPoints.length === 0) return;
        deckOverlayRef.current.setProps({
            layers: [
                new HeatmapLayer<HeatPoint>({
                    id: 'trueserve-heatmap',
                    data: heatPoints,
                    getPosition: (d) => [d.lng, d.lat],
                    getWeight: (d) => d.weight,
                    radiusPixels: 40,
                    intensity: 1,
                    threshold: 0.03,
                    colorRange: HEATMAP_COLOR_RANGE,
                }),
            ],
        });
    }, [heatPoints]);

    // When the GoogleMap mounts, attach the deck.gl overlay to it
    const onMapLoad = useCallback((map: google.maps.Map) => {
        const overlay = new GoogleMapsOverlay({ layers: [] });
        overlay.setMap(map);
        deckOverlayRef.current = overlay;
    }, []);

    // Detach overlay on unmount
    const onMapUnmount = useCallback(() => {
        if (deckOverlayRef.current) {
            deckOverlayRef.current.setMap(null);
            deckOverlayRef.current = null;
        }
    }, []);

    const mapOptions = useMemo(() => ({
        disableDefaultUI: false,
        zoomControl: true,
        styles: darkMapStyle,
        mapTypeControl: false,
        streetViewControl: false,
    }), []);

    if (!isLoaded) {
        return (
            <div className={`${className} bg-slate-900 animate-pulse rounded-xl flex items-center justify-center text-slate-500`}>
                Initializing Real-time Heatmap...
            </div>
        );
    }

    if (!mapCenter) {
        return (
            <div className={`${className} rounded-xl border border-white/10 bg-slate-900 flex items-center justify-center text-slate-400 text-sm`}>
                Waiting for live location to initialize map...
            </div>
        );
    }

    return (
        <div className={`${className} rounded-xl overflow-hidden shadow-lg border border-white/10 relative z-0`}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={11}
                options={mapOptions}
                onLoad={onMapLoad}
                onUnmount={onMapUnmount}
            >
                {/* Driver position marker — MarkerF retained pending AdvancedMarker mapId setup */}
                {mapCenter && (
                    <MarkerF
                        position={mapCenter}
                        icon={{
                            url: "https://maps.google.com/mapfiles/kml/shapes/cabs.png",
                            scaledSize: new window.google.maps.Size(32, 32),
                        }}
                    />
                )}
            </GoogleMap>

            {/* Smart Heatmap badge */}
            <div className="absolute top-3 left-3 z-[10]">
                <div style={{
                    background: "rgba(12,14,19,0.88)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(249,115,22,0.25)",
                    borderRadius: 10,
                    padding: "8px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    minWidth: 180,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ position: "relative", display: "flex", width: 7, height: 7, flexShrink: 0 }}>
                            <span className="animate-ping" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#f97316", opacity: 0.6 }} />
                            <span style={{ position: "relative", width: 7, height: 7, borderRadius: "50%", background: "#f97316", display: "inline-flex" }} />
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f97316" }}>Smart Heatmap</span>
                    </div>
                    <p style={{ fontSize: 10, color: "#666", fontWeight: 600, lineHeight: 1.4, margin: 0 }}>Live orders &amp; predictive demand zones blended automatically.</p>
                </div>
            </div>

            {/* Active regions info bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 z-[10] text-center w-max shadow-2xl">
                <p className="text-[10px] text-slate-400 font-mono">
                    <span className="text-primary font-black text-xs mr-2">{heatPoints.length}</span> Active Regions • Last Sync: {lastUpdate}
                </p>
            </div>
        </div>
    );
}
