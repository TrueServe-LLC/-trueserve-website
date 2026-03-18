"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GoogleMap, useJsApiLoader, HeatmapLayerF, MarkerF } from '@react-google-maps/api';
import { createClient } from "@/lib/supabase/client";
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_SCRIPT_ID, GOOGLE_MAPS_API_KEY } from "@/lib/maps-config";
import { getAIPredictedHeatmap } from "@/app/driver/actions";

// Dark Mode Map Style for Heatmaps
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

const defaultCenter = {
    lat: 35.2271,
    lng: -80.8431
};

export default function DriverMap() {
    const [mapCenter, setMapCenter] = useState(defaultCenter);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setMapCenter({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                () => {
                    console.log("Geolocation permission denied or error. Using default center.");
                }
            );
        }
    }, []);
    const { isLoaded } = useJsApiLoader({
        id: GOOGLE_MAPS_SCRIPT_ID,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES
    });

    const [heatmapData, setHeatmapData] = useState<google.maps.visualization.WeightedLocation[]>([]);
    const [lastUpdate, setLastUpdate] = useState<string>("Loading...");

    // Fetch Initial Data & Subscribe
    useEffect(() => {
        const supabase = createClient();
        let channel: any = null;

        const fetchData = async () => {
            // Fetch initial blended data (Live Orders + AI Predictors)
            const predictedPoints = await getAIPredictedHeatmap();
            const points = predictedPoints.map(p => ({
                location: new google.maps.LatLng(p.lat, p.lng),
                weight: p.weight
            }));
            setHeatmapData(points);
            setLastUpdate(new Date().toLocaleTimeString());
        };

        if (isLoaded) {
            fetchData();

            // Real-time Subscription to continually pump live points into the AI map!
            channel = supabase
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
                            setHeatmapData(prev => [
                                ...prev,
                                {
                                    location: new google.maps.LatLng(rest.lat, rest.lng),
                                    weight: newOrder.total || 25 // Give active live orders an instant heavy weight
                                }
                            ]);
                            setLastUpdate(new Date().toLocaleTimeString());
                        }
                    }
                })
                .subscribe();

            return () => {
                if (channel) supabase.removeChannel(channel);
            };
        }
    }, [isLoaded]);

    const options = useMemo(() => ({
        disableDefaultUI: false,
        zoomControl: true,
        styles: darkMapStyle,
        mapTypeControl: false,
        streetViewControl: false
    }), []);

    if (!isLoaded) {
        return <div className="h-[400px] w-full bg-slate-900 animate-pulse rounded-xl flex items-center justify-center text-slate-500">Initializing Real-time Heatmap...</div>;
    }

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg border border-white/10 relative z-0">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={11}
                options={options}
            >
                {/* Heatmap Layer */}
                {heatmapData.length > 0 && (
                    <HeatmapLayerF
                        data={heatmapData}
                        options={{
                            radius: 40,
                            opacity: 0.8,
                            // Unified Gradient: Live hot centers melt into predictive gold edges
                            gradient: [
                                'rgba(255, 153, 42, 0)',   // Transparent core
                                'rgba(255, 173, 82, 0.4)', // Soft Gold (Predictive boundary)
                                'rgba(255, 153, 42, 0.8)', // Warning Orange 
                                'rgba(239, 68, 68, 1)',    // Hot Red (Live Order Mass)
                                'rgba(185, 28, 28, 1)',    // Deep Red Core
                            ]
                        }}
                    />
                )}

                {/* Driver Car Icon Marker */}
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

            {/* Always-on AI Unified Overlay */}
            <div className="absolute top-4 left-4 flex gap-2 z-[10]">
                <div className="bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/10 flex flex-col items-start gap-1 shadow-2xl">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <h4 className="text-[10px] uppercase font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-primary">Smart Heatmap</h4>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold max-w-[120px]">Live orders & predictive demand zones blended automatically.</p>
                </div>
            </div>

            {/* Info Box */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 z-[10] text-center w-max shadow-2xl">
                <p className="text-[10px] text-slate-400 font-mono">
                    <span className="text-primary font-black text-xs mr-2">{heatmapData.length}</span> Active Regions • Last Sync: {lastUpdate}
                </p>
            </div>
        </div>
    );
}
