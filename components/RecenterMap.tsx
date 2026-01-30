"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function RecenterMap({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center);
    }, [center, map]);
    return null;
}
