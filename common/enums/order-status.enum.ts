export enum OrderStatusEnum {
    PENDING = 'pending',         // Order placed but not yet processed
    CONFIRMED = 'confirmed',
    DELIVERING = 'delivering',   // Order is being shipped
    FINISHED = 'finished',       // Order completed/delivered
    CANCELLED = 'cancelled',      // Order canceled by user or system
    RETURNED = 'returned',
    FAILED = 'failed'
}