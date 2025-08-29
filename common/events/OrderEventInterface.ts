import { Types } from "mongoose";
import { SubjectsEnum } from "../enums/event-subject.enum";
import { OrderStatusEnum } from "../enums/order-status.enum";
import { PaymentMethodEnum } from "../enums/payment-method.enum";

interface OrderAttrs {
    _id: string;
    user_id: string;// FK to User
    products: {
        product_id: string;
        price: number;
        quantity: number;
    }[];
    status: OrderStatusEnum;
    payment_method: PaymentMethodEnum;
    total_price: number;
    version: number;
}


export interface OrderCreatedEventInterface {
    subject: SubjectsEnum.OrderCreated;
    data: OrderAttrs;
}

export interface OrderUpdatedEventInterface {
    subject: SubjectsEnum.OrderUpdated;
    data: OrderAttrs;
}

export interface OrderCancelledEventInterface {
    subject: SubjectsEnum.OrderCancelled;
    data: {
        _id: string;
        version: number;
    };
}
