"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DriverRealtime({ driverId }: { driverId: string }) {
    const router = useRouter();
    const [lastStatus, setLastStatus] = useState<string | null>(null);

    useEffect(() => {
        if (!driverId) return;

        // Listen for status changes on orders assigned to this driver
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

                    // If the order status changed to READY_FOR_PICKUP, notify the driver
                    if (newStatus === "READY_FOR_PICKUP" && lastStatus !== "READY_FOR_PICKUP") {
                        // Play a notification sound
                        try {
                            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                            audio.play().catch(e => console.log("Audio play blocked by browser"));
                        } catch (e) { }

                        // Show a browser notification if permitted
                        if ("Notification" in window && Notification.permission === "granted") {
                            new Notification("Order Ready!", {
                                body: "An order you accepted is now ready at the restaurant.",
                                icon: "/favicon.ico"
                            });
                        }
                    }

                    setLastStatus(newStatus);
                    // Refresh the server component data
                    router.refresh();
                }
            )
            .subscribe();

        // Also listen for NEW available orders (broadcast style or table watch)
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
                        // Play a subtle ping for new work
                        try {
                            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
                            audio.play().catch(e => console.log("Audio play blocked"));
                        } catch (e) { }
                        router.refresh();
                    }
                }
            )
            .subscribe();

        // Request notification permission on mount
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        return () => {
            supabase.removeChannel(channel);
            supabase.removeChannel(availabilityChannel);
        };
    }, [driverId, router, lastStatus]);

    return null; // Invisible component
}
