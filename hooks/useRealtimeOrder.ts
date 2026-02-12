
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useRealtimeOrder(orderId: string) {
    const [order, setOrder] = useState<any>(null);
    const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
    const supabase = createClient();

    useEffect(() => {
        // 1. Fetch initial state
        const fetchOrder = async () => {
            const { data } = await supabase
                .from('Order')
                .select('*, restaurant:Restaurant(*), driver:User(*)')
                .eq('id', orderId)
                .single();
            if (data) setOrder(data);
        };
        fetchOrder();

        // 2. Subscribe to Order changes (e.g. status updates)
        const orderSubscription = supabase
            .channel(`order-${orderId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'Order',
                    filter: `id=eq.${orderId}`
                },
                (payload) => {
                    setOrder((prev: any) => ({ ...prev, ...payload.new }));
                }
            )
            .subscribe();

        // 3. Subscribe to Driver Location changes (if a driver is assigned)
        // Note: You need a separate 'DriverLocation' table or column that updates frequently
        const locationSubscription = supabase
            .channel(`driver-location`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT', // or UPDATE depending on how you log locations
                    schema: 'public',
                    table: 'DriverLocation',
                    filter: `orderId=eq.${orderId}` // Assuming you link location logs to orders
                },
                (payload) => {
                    setDriverLocation({
                        lat: payload.new.lat,
                        lng: payload.new.lng
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(orderSubscription);
            supabase.removeChannel(locationSubscription);
        };
    }, [orderId]);

    return { order, driverLocation };
}
