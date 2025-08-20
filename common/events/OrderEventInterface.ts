import { SubjectsEnum } from "../enums/event-subject.enum";
import { OrderAttrs, OrderDoc } from "../models/order.model";

export interface OrderCreatedEventInterface{
    subject: SubjectsEnum.OrderCreated;
    data: OrderAttrs;
}

export interface OrderUpdatedEventInterface{
    subject: SubjectsEnum.OrderUpdated;
    data: Partial<OrderAttrs>;
}

export interface OrderCancelledEventInterface {
    subject: SubjectsEnum.OrderCancelled;
    data: OrderDoc;
}
