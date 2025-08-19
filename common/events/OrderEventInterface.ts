import { SubjectsEnum } from "../enums/event-subject.enum";
import { OrderAttrs } from "../models/order.model";

export interface OrderCreatedEventInterface{
    subject: SubjectsEnum.OrderCreated;
    data: OrderAttrs;
}

export interface OrderUpdatedEventInterface{
    subject: SubjectsEnum.OrderUpdated;
    data: Partial<OrderAttrs>;
}

export interface OrderDeletedEventInterface {
    subject: SubjectsEnum.OrderDeleted;
    data: {
        id: string;
    };
}
