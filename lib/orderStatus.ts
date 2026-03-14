
/**
 * Order Status Lifecycle Management
 */

export type OrderStatus = 
  | 'PENDING' 
  | 'ACCEPTED' 
  | 'PREPARING' 
  | 'READY' 
  | 'PICKED_UP' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'REFUNDED';

// Define valid "forward" movements in the workflow
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    'PENDING': ['ACCEPTED', 'CANCELLED'],
    'ACCEPTED': ['PREPARING', 'CANCELLED'],
    'PREPARING': ['READY', 'CANCELLED'],
    'READY': ['PICKED_UP', 'CANCELLED'],
    'PICKED_UP': ['DELIVERED'], // Pickup is final, cannot cancel via driver app after pickup (requires support)
    'DELIVERED': [], // End of the line
    'CANCELLED': [], // End of the line
    'REFUNDED': []   // End of the line
};

/**
 * Validates if an order can move from currentState to nextState.
 * This is the "Truth" for all business workflows in TrueServe.
 */
export function isValidTransition(current: OrderStatus, next: OrderStatus): boolean {
    if (current === next) return true;
    
    const allowed = VALID_TRANSITIONS[current] || [];
    return allowed.includes(next);
}
