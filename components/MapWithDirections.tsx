
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
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
}

export default function MapWithDirections({ origin, destination }: MapWithDirectionsProps) {
    const { isLoaded } = useJsApiLoader({
        id: GOOGLE_MAPS_SCRIPT_ID,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES
    });

    const [response, setResponse] = useState<google.maps.DirectionsResult | null>(null);

    const directionsCallback = useCallback((
        result: google.maps.DirectionsResult | null,
        status: google.maps.DirectionsStatus
    ) => {
        if (result !== null) {
            if (status === 'OK') {
                setResponse(result);
            } else {
                console.error(`Directions request failed due to ${status}`);
            }
        }
    }, []);

    // Reset response if origin/destination changes so we re-fetch
    useEffect(() => {
        setResponse(null);
    }, [origin, destination]);

    if (!isLoaded) return <div>Loading Map...</div>;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
        >
            {origin && destination && !response && (
                <DirectionsService
                    options={{
                        destination: destination,
                        origin: origin,
                        travelMode: google.maps.TravelMode.DRIVING,
                    }}
                    callback={directionsCallback}
                />
            )}

            {response && (
                <DirectionsRenderer
                    options={{
                        directions: response
                    }}
                />
            )}
        </GoogleMap>
    );
}
