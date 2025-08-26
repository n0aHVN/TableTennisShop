import { NotFoundError } from "@tabletennisshop/common";
import { OrderCreatedPublisher } from "../events/publishers/OrderCreatedListener";
import { natsWrapper } from "../NatsWrapper";
import { OrderAttrs, OrderDoc, OrderModel } from "../models/order.model";

export class OrderService{
    static async createOrder(data: OrderAttrs){
        const order = OrderModel.build(data);
        const orderDoc = await order.save();
        new OrderCreatedPublisher(natsWrapper.client).publish({
            _id: orderDoc._id,
            user_id: orderDoc.user_id,
            products: orderDoc.products,
            status: orderDoc.status,
            payment_method: orderDoc.payment_method,
            version: orderDoc.version
        });
        
    }
    static async getOrdersByUserId(id: string): Promise<OrderDoc[]> {
        const orders = await OrderModel.find({ user_id: id }).exec();
        if (!orders){
            throw new NotFoundError("Orders by user id are not found");
        }
        return orders;
    }
    static async getOrderById({userId, order_id}: {userId: string, order_id: string}): Promise<OrderDoc> {
        console.log("userId, order_id", userId, order_id);
        const order = await OrderModel.findOne({ _id: order_id, user_id: userId }).exec();
        if (!order) {
            throw new NotFoundError("Order not found");
        }
        return order;
    }
}