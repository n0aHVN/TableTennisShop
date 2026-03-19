import { BadRequestError, NotFoundError, OrderStatusEnum } from "@tabletennisshop/common";
import { OrderCreatedPublisher } from "../events/publishers/OrderCreatedPublisher";
import { natsWrapper } from "../NatsWrapper";
import { OrderAttrs, OrderDoc, OrderModel } from "../models/order.model";
import mongoose from "mongoose";
import { OrderCancelledPublisher } from "../events/publishers/OrderCancelledPublisher";
import { OrderUpdatedPublisher } from "../events/publishers/OrderUpdatedPublisher";
import { InventoryService } from "./inventory.service";

interface UpdateOrderByUserAttrs extends Partial<Omit<OrderAttrs, "user_id">> {
    _id: string;
    user_id: string;
}

interface UpdateOrderByIdAttrs extends Partial<OrderAttrs> {
    _id: string;
}

interface CreateOrderAttrs extends Omit<OrderAttrs, "expiresAt"> { }

export class OrderService {
    static async createOrder(data: CreateOrderAttrs) {
        const expiresAt = new Date(Date.now() + 1000 * 60); // 1 minute from now
        const order = OrderModel.build({ ...data, expiresAt });
        const orderDoc = await order.save();

        for (const product of data.products) {
            const inventory = await InventoryService.getInventoryByProductId(product.product_id);
            if (inventory.total_quantity < product.quantity) {
                throw new BadRequestError("Insufficient stock");
            }
        }

        new OrderCreatedPublisher(natsWrapper.client).publish({
            _id: orderDoc._id.toHexString(),
            user_id: orderDoc.user_id.toHexString(),
            total_price: orderDoc.total_price,
            status: orderDoc.status,
            payment_method: orderDoc.payment_method,
            version: orderDoc.version,
            products: orderDoc.products.map(p => ({
                product_id: p.product_id.toHexString(),
                quantity: p.quantity,
                price: p.price,
                item_codes: p.item_codes || []
            })),
            expiresAt: orderDoc.expiresAt.toISOString()
        });
        return orderDoc;

    }
    static async getOrdersByUserId(id: string): Promise<OrderDoc[]> {
        const orders = await OrderModel.find({ user_id: id }).exec();
        if (!orders) {
            throw new NotFoundError("Orders by user id are not found");
        }
        return orders;
    }
    static async getOrderById({ userId, order_id }: { userId: string, order_id: string }): Promise<OrderDoc> {
        const order = await OrderModel.findOne({ _id: order_id, user_id: userId }).exec();
        if (!order) {
            throw new NotFoundError("Order not found");
        }
        return order;
    }

    static async updateOrderByUser(data: UpdateOrderByUserAttrs): Promise<OrderDoc> {
        const order = await OrderModel.findOne({ _id: data._id, user_id: data.user_id }).exec();
        if (!order) {
            throw new NotFoundError("Order not found");
        }
        return this.applyUpdates(order, data);
    }

    static async updateOrderById(data: UpdateOrderByIdAttrs): Promise<OrderDoc> {
        const order = await OrderModel.findById(data._id).exec();
        if (!order) {
            throw new NotFoundError("Order not found");
        }
        return this.applyUpdates(order, data);
    }

    // shared internal method to avoid duplicating update logic
    private static async applyUpdates(order: OrderDoc, data: Partial<OrderAttrs>): Promise<OrderDoc> {
        if (data.total_price !== undefined) order.total_price = data.total_price;
        if (data.status !== undefined) order.status = data.status;
        if (data.payment_method !== undefined) order.payment_method = data.payment_method;
        if (data.products !== undefined) {
            order.products = data.products.map(p => ({
                product_id: new mongoose.Types.ObjectId(p.product_id),
                quantity: p.quantity,
                price: p.price,
                item_codes: p.item_codes || []
            }));
        }
        if (data.expiresAt !== undefined) order.expiresAt = new Date(data.expiresAt);

        await order.save();

        await new OrderUpdatedPublisher(natsWrapper.client).publish({
            _id: order._id.toHexString(),
            user_id: order.user_id.toHexString(),
            total_price: order.total_price,
            status: order.status,
            payment_method: order.payment_method,
            version: order.version,
            products: order.products.map(p => ({
                product_id: p.product_id.toHexString(),
                quantity: p.quantity,
                price: p.price,
                item_codes: p.item_codes || []
            })),
            expiresAt: order.expiresAt.toISOString()
        });

        if (data.status === OrderStatusEnum.CANCELLED) {
            await this.cancelOrder({ userId: order.user_id.toHexString(), order_id: order._id.toHexString() });
        }

        return order;
    }


    static async cancelOrder({ userId, order_id }: { userId: string, order_id: string }): Promise<OrderDoc> {
        const order = await OrderModel.findOne({ _id: order_id, user_id: userId }).exec();
        if (!order) {
            throw new NotFoundError("Order not found");
        }
        order.status = OrderStatusEnum.CANCELLED;
        await order.save();
        await new OrderCancelledPublisher(natsWrapper.client).publish({
            _id: order._id.toHexString(),
            user_id: order.user_id.toHexString(),
            payment_method: order.payment_method,
            total_price: order.total_price,
            products: order.products.map(p => ({
                product_id: p.product_id.toHexString(),
                quantity: p.quantity,
                price: p.price,
                item_codes: p.item_codes || []
            })),
            status: order.status,
            version: order.version,
            expiresAt: order.expiresAt.toISOString()
        });
        return order;
    }
}