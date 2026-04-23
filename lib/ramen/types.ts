// RAMEN — Real-time Asynchronous Messaging Network
// Channel-based event streaming layer for driver locations and order lifecycle events.
// Transport: SSE today; designed to migrate to gRPC-web without consumer changes.

export type RamenEventType =
  | 'driver_location'
  | 'order_status'
  | 'order_eta'
  | 'heartbeat';

export interface DriverLocationPayload {
  driverId: string;
  orderId?: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
}

export interface OrderStatusPayload {
  orderId: string;
  status: string;
  updatedAt: string;
}

export interface OrderEtaPayload {
  orderId: string;
  etaSeconds: number;
  distanceMeters: number;
}

export type RamenPayload =
  | DriverLocationPayload
  | OrderStatusPayload
  | OrderEtaPayload
  | Record<string, unknown>;

export interface RamenEvent<T extends RamenPayload = RamenPayload> {
  id: string;
  type: RamenEventType;
  channel: string;
  payload: T;
  ts: number;
}

// Channel naming conventions:
//   driver-loc:{driverId}   — location pings from a specific driver
//   order:{orderId}         — order lifecycle events
export function driverLocChannel(driverId: string) {
  return `driver-loc:${driverId}`;
}
export function orderChannel(orderId: string) {
  return `order:${orderId}`;
}
