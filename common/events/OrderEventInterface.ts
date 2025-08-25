import { Types } from "mongoose";
import { SubjectsEnum } from "../enums/event-subject.enum";
import { OrderStatusEnum } from "../enums/order-status.enum";
import { PaymentMethodEnum } from "../enums/payment-method.enum";

interface IOrderProduct {
  product_id: Types.ObjectId; // FK to Product
  price: number; // Price of the product at the time of order
  quantity: number;
}

interface OrderAttrs {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;// FK to User
  products: IOrderProduct[];
  status: OrderStatusEnum;
  payment_method: PaymentMethodEnum;
  version: number;
}


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
    data: {
        id: Types.ObjectId;
        version: number;
    };
}
