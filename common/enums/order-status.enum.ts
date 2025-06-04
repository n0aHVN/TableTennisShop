export enum OrderStatusEnum {
    Pending = 'pending',         // Order placed but not yet processed
    Confirmed = 'confirmed',
    Delivering = 'delivering',   // Order is being shipped
    Finished = 'finished',       // Order completed/delivered
    Cancelled = 'cancelled',      // Order canceled by user or system
    Returned = 'returned',
    Failed = 'failed'
}