export enum OrderStatusEnum {
    PENDING = 'pending',         // Order placed but not yet processed
    FINISHED = 'finished',       // Order completed/delivered
    EXPIRED = 'expired',      // Order expired
    CANCELLED = 'cancelled'      // Order cancelled by user or system
}