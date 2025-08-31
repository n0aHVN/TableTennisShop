import { OrderStatusEnum } from "@tabletennisshop/common/build/enums/order-status.enum";
import { OrderAttrs, OrderModel } from "../models/order.model";
import { PaymentMethodEnum } from "@tabletennisshop/common/build/enums/payment-method.enum";
import { OrderUpdatedEventInterface } from "@tabletennisshop/common";

export class OrderService {
    static async createOrder(data: OrderAttrs) {
        const order = OrderModel.build(data);
        await order.save();
        return order;
    }

    static async getOrderById(id: string) {
        return await OrderModel.findById(id);
    }

    static async updateOrder(data: OrderUpdatedEventInterface["data"]) {
        const order = await OrderModel.findOne({ _id: data._id , version: data.version - 1}).exec();
        if (!order) throw new Error("Order not found");
        if (data.payment_method != undefined) order.payment_method = data.payment_method;
        if (data.status != undefined) order.status = data.status;
        if (data.total_price != undefined) order.total_price = data.total_price;
        await order.save();
        return order;
    }
    static async cancelOrder(data: { _id: string, version: number }) {
        const order = await OrderModel.findOne({ _id: data._id, version: data.version - 1 }).exec();
        if (!order) throw new Error("Order not found");
        order.status = OrderStatusEnum.CANCELLED;
        await order.save();
        return order;
    }
    static async deleteOrder(id: string) {
        return await OrderModel.findByIdAndDelete(id);
    }
}
