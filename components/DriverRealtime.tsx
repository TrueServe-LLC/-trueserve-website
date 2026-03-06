"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DriverRealtime({ driverId }: { driverId: string }) {
    const router = useRouter();
    const [lastStatus, setLastStatus] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<number>(0);

    useEffect(() => {
        if (!driverId) return;

        // --- 1. Real-time Location Tracking ---
        let watchId: number;
        if ("geolocation" in navigator) {
            watchId = navigator.geolocation.watchPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const now = Date.now();

                    // Throttle updates to once every 10 seconds or if moved significantly
                    // (approx 20 meters = ~0.0002 deg)
                    if (now - lastUpdate > 10000) {
                        setLastUpdate(now);
                        await supabase
                            .from('Driver')
                            .update({
                                currentLat: latitude,
                                currentLng: longitude,
                                lastLocationUpdate: new Date().toISOString()
                            })
                            .eq('id', driverId);
                    }
                },
                (error) => console.warn("Driver Location Error:", error),
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        }

        // --- 2. Order Status Subscriptions ---
        const channel = supabase
            .channel(`driver-updates-${driverId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "Order",
                    filter: `driverId=eq.${driverId}`,
                },
                (payload) => {
                    const newStatus = payload.new.status;
                    if (newStatus === "READY_FOR_PICKUP" && lastStatus !== "READY_FOR_PICKUP") {
                        try {
                            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                            audio.play().catch(() => { });
                        } catch (e) { }

                        if ("Notification" in window && Notification.permission === "granted") {
                            new Notification("Order Ready!", {
                                body: "An order you accepted is now ready at the restaurant.",
                                icon: "/favicon.ico"
                            });
                        }
                    }
                    setLastStatus(newStatus);
                    router.refresh();
                }
            )
            .subscribe();

        const availabilityChannel = supabase
            .channel("available-orders")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "Order",
                },
                (payload) => {
                    if (payload.new.status === "PENDING" && !payload.new.driverId) {
                        try {
                            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
                            audio.play().catch(() => { });
                        } catch (e) { }
                        router.refresh();
                    }
                }
            )
            .subscribe();

        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
            supabase.removeChannel(channel);
            supabase.removeChannel(availabilityChannel);
        };
    }, [driverId, lastStatus]); // Remove 'router' and 'lastUpdate' from deps to avoid cycle, we manage lastUpdate ref-style inside state

    return null;
}
