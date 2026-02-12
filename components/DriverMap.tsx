"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GoogleMap, useJsApiLoader, HeatmapLayerF } from '@react-google-maps/api';
import { createClient } from "@/lib/supabase/client";
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_SCRIPT_ID, GOOGLE_MAPS_API_KEY } from "@/lib/maps-config";

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

        // 1. Fetch recent orders (last 7 days for demo density)
        const fetchHeatmap = async () => {
            // Join with Restaurant to get coords
            const { data, error } = await supabase
                .from('Order')
                .select(`
                    total,
                    restaurant:Restaurant(lat, lng)
                `)
                .order('createdAt', { ascending: false })
                .limit(100);

            if (data) {
                const points = data
                    .filter((o: any) => o.restaurant?.lat && o.restaurant?.lng)
                    .map((o: any) => ({
                        location: new google.maps.LatLng(o.restaurant.lat, o.restaurant.lng),
                        weight: o.total // Higher order value = more "heat"
                    }));
                setHeatmapData(points);
                setLastUpdate(new Date().toLocaleTimeString());
            }
        };

        if (isLoaded) {
            fetchHeatmap();

            // 2. Real-time Subscription
            const channel = supabase
                .channel('realtime-orders')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Order' }, async (payload) => {
                    console.log('New Order! Updating Heatmap...', payload);
                    // We need to fetch the restaurant coords for this new order
                    // Payload only has order data usually
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
                                    weight: newOrder.total || 10
                                }
                            ]);
                            setLastUpdate(new Date().toLocaleTimeString());
                        }
                    }
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
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
                            // Gradient: Blue -> Green -> Red
                            gradient: [
                                'rgba(0, 255, 255, 0)',
                                'rgba(0, 255, 255, 1)',
                                'rgba(0, 191, 255, 1)',
                                'rgba(0, 127, 255, 1)',
                                'rgba(0, 63, 255, 1)',
                                'rgba(0, 0, 255, 1)',
                                'rgba(0, 0, 223, 1)',
                                'rgba(0, 0, 191, 1)',
                                'rgba(0, 0, 159, 1)',
                                'rgba(0, 0, 127, 1)',
                                'rgba(63, 0, 91, 1)',
                                'rgba(127, 0, 63, 1)',
                                'rgba(191, 0, 31, 1)',
                                'rgba(255, 0, 0, 1)'
                            ]
                        }}
                    />
                )}
            </GoogleMap>

            {/* Live Data Overlay */}
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md p-4 rounded-lg border border-white/10 z-[10]">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]"></div>
                    <h4 className="text-xs font-bold uppercase text-white tracking-widest">Live Demand</h4>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                    <p>Points: <span className="text-emerald-400">{heatmapData.length}</span></p>
                    <p>Last Update: <span className="text-white">{lastUpdate}</span></p>
                </div>
                <div className="mt-2 h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-full"></div>
                <div className="flex justify-between text-[8px] text-slate-500 mt-1 font-bold uppercase">
                    <span>Low</span>
                    <span>High</span>
                </div>
            </div>
        </div>
    );
}
