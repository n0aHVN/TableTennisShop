import { OrderAttrs, OrderDoc, OrderModel } from "@tabletennisshop/common";
import { OrderCreatedPublisher } from "../events/publishers/OrderCreatedListener";
import { natsWrapper } from "../NatsWrapper";

export class OrderService{
    static createOrder(data: OrderAttrs){
        new OrderCreatedPublisher(natsWrapper.client).publish(data);
        return OrderModel.build(data);
    }
    static async getOrdersByUserId(id: string): Promise<OrderDoc[] | null> {
        return OrderModel.find({ user_id: id }).exec();
    }
    static async getOrderByUserId({user_id, order_id}: {user_id: string, order_id: string}): Promise<OrderDoc | null> {
        return OrderModel.findOne({ user_id, _id: order_id }).exec();
    }
}