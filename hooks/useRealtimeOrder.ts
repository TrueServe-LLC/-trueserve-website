
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

        let locationSubscription: any = null;

        // 3. Subscribe to Driver Location changes (if a driver is assigned)
        if (order?.driverId) {
            locationSubscription = supabase
                .channel(`driver-location-${order.driverId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'Driver',
                        filter: `id=eq.${order.driverId}`
                    },
                    (payload) => {
                        if (payload.new.currentLat && payload.new.currentLng) {
                            setDriverLocation({
                                lat: payload.new.currentLat,
                                lng: payload.new.currentLng
                            });
                        }
                    }
                )
                .subscribe();
        }

        return () => {
            supabase.removeChannel(orderSubscription);
            if (locationSubscription) {
                supabase.removeChannel(locationSubscription);
            }
        };
    }, [orderId, order?.driverId]);

    return { order, driverLocation };
}
