
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, OverlayView } from '@react-google-maps/api';
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_SCRIPT_ID, GOOGLE_MAPS_API_KEY } from "@/lib/maps-config";

const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '1rem'
};

const center = {
    lat: 35.2271,
    lng: -80.8431
};

interface MapWithDirectionsProps {
    origin?: string | google.maps.LatLngLiteral;
    destination?: string | google.maps.LatLngLiteral;
    routeOrigin?: string | google.maps.LatLngLiteral; // For calculating the blue line (stable)
    driverRotation?: number;
    showDriver?: boolean;
}

export default function MapWithDirections({ origin, destination, routeOrigin, driverRotation = 0, showDriver = true }: MapWithDirectionsProps) {
    const { isLoaded } = useJsApiLoader({
        id: GOOGLE_MAPS_SCRIPT_ID,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES
    });

    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

    // Use routeOrigin (Restaurant) for the path if provided, otherwise stick to origin (Driver)
    // This allows the path to be stable (Restaurant -> Customer) while the car moves
    const startPoint = routeOrigin || origin;

    // Fetch Directions Imperatively - Only if startPoint or destination changes
    useEffect(() => {
        if (!isLoaded || !startPoint || !destination) return;

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route({
            origin: startPoint,
            destination: destination,
            travelMode: window.google.maps.TravelMode.DRIVING
        }, (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK && result) {
                setDirections(result);
            } else {
                console.error(`Directions request failed due to ${status}`);
            }
        });

    }, [isLoaded, startPoint, destination]); // Dependencies updated to use startPoint


    if (!isLoaded) return <div className="h-[400px] w-full bg-slate-900 animate-pulse rounded-2xl flex items-center justify-center text-slate-500">Loading Map...</div>;

    // Standard Light Mode (Matches reference image)
    const defaultLightStyle: google.maps.MapTypeStyle[] = [];

    // Center map on Driver (origin) if available, else startPoint
    const mapCenter = (typeof origin === 'object' && origin !== null && 'lat' in origin) ? origin : center;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={14} // Zoomed in slightly more for better view
            options={{
                styles: defaultLightStyle,
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
            }}
        >
            {/* 1. The Route Line - Google Blue */}
            {directions && (
                <DirectionsRenderer
                    options={{
                        directions: directions,
                        suppressMarkers: true,
                        polylineOptions: {
                            strokeColor: "#4285F4", // Google Blue
                            strokeWeight: 6,
                            strokeOpacity: 0.8,
                        }
                    }}
                />
            )}

            {/* 0. Restaurant/Start Marker - Only if routeOrigin is coordinates */}
            {routeOrigin && typeof routeOrigin === 'object' && (
                <Marker
                    position={routeOrigin}
                    title="Restaurant"
                    label={{
                        text: "🏪",
                        fontSize: "20px"
                    }}
                />
            )}

            {/* 2. Driver Marker (Rotated Car) - Only define if origin is coordinates */}
            {origin && typeof origin === 'object' && showDriver && (
                <OverlayView
                    position={origin}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                    <div
                        style={{
                            transform: `translate(-50%, -50%) rotate(${driverRotation}deg)`,
                            fontSize: '2.5rem', // Slightly larger
                            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
                            transition: 'transform 0.1s linear' // Smooth rotation
                        }}
                    >
                        🚗
                    </div>
                </OverlayView>
            )}

            {/* 4. Route Info Overlay (Mimics User Reference Image) */}
            {directions && directions.routes[0] && directions.routes[0].legs[0] && (() => {
                const leg = directions.routes[0].legs[0];
                const steps = leg.steps;
                // Find a midpoint step for the label position
                const midStepIndex = Math.floor(steps.length / 2);
                const infoPosition = steps[midStepIndex]?.end_location || leg.end_location;

                return (
                    <OverlayView
                        position={infoPosition}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                        <div className="bg-white px-3 py-2 rounded-lg shadow-xl border border-slate-200 transform -translate-x-1/2 -translate-y-[120%] flex flex-col items-center min-w-[120px]">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg font-bold text-slate-800">{leg.duration?.text || "Calculating..."}</span>
                            </div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                {leg.distance?.text || ""}
                            </div>
                            {/* Little triangle arrow at bottom */}
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white filter drop-shadow-sm"></div>
                        </div>
                    </OverlayView>
                );
            })()}

            {/* 3. Destination Marker (Customer) - Red Pin - Only define if destination is coordinates */}
            {destination && typeof destination === 'object' && (
                <Marker
                    position={destination}
                    title="Delivery Location"
                    animation={typeof google !== 'undefined' ? google.maps.Animation.DROP : undefined}
                />
            )}
        </GoogleMap>
    );
}



