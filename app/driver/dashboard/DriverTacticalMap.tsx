"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, OverlayView } from '@react-google-maps/api';
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_SCRIPT_ID, GOOGLE_MAPS_API_KEY } from "@/lib/maps-config";

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '2rem'
};

const defaultCenter = {
    lat: 35.2271,
    lng: -80.8431
};

interface DriverTacticalMapProps {
    availableOrders: any[];
    activeMission?: any;
    driverLocation?: { lat: number, lng: number };
}

export default function DriverTacticalMap({ availableOrders, activeMission, driverLocation }: DriverTacticalMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: GOOGLE_MAPS_SCRIPT_ID,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES
    });

    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMapRef(map);
    }, []);

    // Fetch directions if active mission exists
    useEffect(() => {
        if (!isLoaded || !activeMission || !driverLocation) return;

        const directionsService = new window.google.maps.DirectionsService();
        const destination = activeMission.status === 'PICKED_UP' 
            ? activeMission.deliveryAddress 
            : { lat: Number(activeMission.restaurant.lat), lng: Number(activeMission.restaurant.lng) };

        directionsService.route({
            origin: driverLocation,
            destination: destination as any,
            travelMode: window.google.maps.TravelMode.DRIVING,
        }, (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
                setDirections(result);
            }
        });
    }, [isLoaded, activeMission, driverLocation]);

    // Industrial Dark Mode Style
    const darkStyle: google.maps.MapTypeStyle[] = [
        { "elementType": "geometry", "stylers": [{ "color": "#080808" }] },
        { "elementType": "labels.text.fill", "stylers": [{ "color": "#525252" }] },
        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#080808" }] },
        { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#1c1f28" }] },
        { "featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [{ "color": "#0c0c0e" }] },
        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#333333" }] },
        { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1c1f28" }] },
        { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#525252" }] },
        { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#2a2f3a" }] },
        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
    ];

    if (!isLoaded) return (
        <div className="w-full h-full bg-[#0c0c0e] animate-pulse rounded-[2rem] flex items-center justify-center border border-white/5">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#222] italic">Initializing Tactical Grid...</span>
        </div>
    );

    return (
        <div className="w-full h-full relative group">
            <style jsx global>{`
                .gm-style-cc, .gm-style-mtc, .gm-svpc, .gm-fullscreen-control { display: none !important; }
                .tactical-overlay { pointer-events: none; position: absolute; inset: 0; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px); z-index: 50; border-radius: 2rem; border: 1px solid rgba(232, 162, 48, 0.1); }
            `}</style>
            
            <div className="tactical-overlay"></div>

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={driverLocation || defaultCenter}
                zoom={14}
                onLoad={onLoad}
                options={{
                    styles: darkStyle,
                    disableDefaultUI: true,
                    zoomControl: false,
                    gestureHandling: "cooperative"
                }}
            >
                {/* 1. Driver Location */}
                {driverLocation && (
                    <OverlayView
                        position={driverLocation}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                        <div className="relative flex items-center justify-center w-12 h-12">
                            <div className="absolute inset-0 bg-[#e8a230]/20 rounded-full animate-ping"></div>
                            <div className="absolute inset-4 bg-[#e8a230] rounded-full shadow-[0_0_20px_#e8a230] border-2 border-black"></div>
                        </div>
                    </OverlayView>
                )}

                {/* 2. Opportunities (Nearby Pickups) */}
                {!activeMission && availableOrders.map(order => (
                    <Marker
                        key={order.id}
                        position={{ lat: Number(order.restaurant.lat), lng: Number(order.restaurant.lng) }}
                        icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: "#e8a230",
                            fillOpacity: 0.8,
                            strokeColor: "#000",
                            strokeWeight: 2,
                        }}
                        label={{
                            text: `$${(order.totalPay || order.total).toFixed(0)}`,
                            color: "#fff",
                            fontSize: "10px",
                            fontWeight: "900",
                            className: "map-label-bg"
                        }}
                    />
                ))}

                {/* 3. Active Mission Route */}
                {directions && (
                    <DirectionsRenderer
                        options={{
                            directions: directions,
                            suppressMarkers: true,
                            polylineOptions: {
                                strokeColor: "#e8a230",
                                strokeWeight: 4,
                                strokeOpacity: 0.6,
                            }
                        }}
                    />
                )}

                {/* 4. Destination Marker */}
                {activeMission && (
                    <Marker
                        position={directions?.routes[0].legs[0].end_location as any}
                        label={{
                            text: activeMission.status === 'PICKED_UP' ? "🏁" : "🏬",
                            fontSize: "16px"
                        }}
                    />
                )}
            </GoogleMap>

            {/* HUD OVERLAY */}
            <div className="absolute top-6 left-6 z-[60]">
                <div className="bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#e8a230] animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#e8a230] italic">Tactical Grid Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
