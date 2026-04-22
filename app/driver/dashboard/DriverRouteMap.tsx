"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const MapWithDirections = dynamic(() => import("@/components/MapWithDirections"), { ssr: false });

interface DriverRouteMapProps {
  driverLat: number;
  driverLng: number;
  /** Restaurant lat/lng — used as destination when heading to pickup */
  restaurantLat?: number | null;
  restaurantLng?: number | null;
  /** Customer delivery address string — used as destination after pickup */
  deliveryAddress?: string | null;
  /** PICKED_UP means driver is heading to customer; otherwise heading to restaurant */
  status: string;
}

export default function DriverRouteMap({
  driverLat,
  driverLng,
  restaurantLat,
  restaurantLng,
  deliveryAddress,
  status,
}: DriverRouteMapProps) {
  const [duration, setDuration] = useState<string | null>(null);
  const [distance, setDistance] = useState<string | null>(null);

  const driverPos = { lat: driverLat, lng: driverLng };

  const isPickedUp = status === "PICKED_UP";

  const destination: google.maps.LatLngLiteral | string | undefined = isPickedUp
    ? (deliveryAddress ?? undefined)
    : restaurantLat != null && restaurantLng != null
    ? { lat: restaurantLat, lng: restaurantLng }
    : undefined;

  const routeOrigin = isPickedUp && restaurantLat != null && restaurantLng != null
    ? { lat: restaurantLat, lng: restaurantLng }
    : undefined;

  return (
    <div>
      <div style={{ borderRadius: 10, overflow: "hidden", height: 260, border: "0.5px solid #2e2e2e" }}>
        <MapWithDirections
          origin={driverPos}
          destination={destination}
          routeOrigin={routeOrigin}
          showDriver
          height={260}
          onDurationUpdate={setDuration}
          onDistanceUpdate={setDistance}
        />
      </div>

      {/* Route stats strip */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 6,
        marginTop: 10,
      }}>
        <div style={{
          background: "#111",
          border: "0.5px solid #242424",
          borderRadius: 8,
          padding: "10px 14px",
        }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#555", marginBottom: 4 }}>ETA</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: duration ? "#f97316" : "#333" }}>
            {duration ?? "—"}
          </div>
        </div>
        <div style={{
          background: "#111",
          border: "0.5px solid #242424",
          borderRadius: 8,
          padding: "10px 14px",
        }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#555", marginBottom: 4 }}>Distance</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: distance ? "#fff" : "#333" }}>
            {distance ?? "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
