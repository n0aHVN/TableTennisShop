import { OrderAttrs, OrderModel } from "@tabletennisshop/common";

export class OrderService{
    static createOrder(data: OrderAttrs){
        return OrderModel.build(data);
    }
}