import { Types } from "mongoose";
import { OrderCreatedListener } from "../OrderCreatedListener";
import { OrderCreatedEventInterface, OrderStatusEnum, PaymentMethodEnum } from "@tabletennisshop/common";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../NatsWrapper";
import { OrderModel } from "../../../models/order.model";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const orderData: OrderCreatedEventInterface["data"] = {
        _id: new Types.ObjectId().toHexString(),
        user_id: new Types.ObjectId().toHexString(),
        status: OrderStatusEnum.PENDING,
        total_price: 1000,
        payment_method: PaymentMethodEnum.BANKING,
        version: 0,
        products:[{
            price: 100,
            product_id: new Types.ObjectId().toHexString(),
            quantity: 1,
            item_codes: []
        }]
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return { listener, orderData, message };
};

it("creates and saves an order", async () => {
    const { listener, orderData, message } = await setup();

    await listener.onMessage(orderData, message);

    const order = await OrderModel.findById(orderData._id);
    expect(order).toBeDefined();
    expect(order!.total_price).toBe(orderData.total_price);
    expect(order!.status).toBe(orderData.status);
    expect(order!.version).toBe(orderData.version);
});

it("acknowledges the message", async () => {
    const { listener, orderData, message } = await setup();

    await listener.onMessage(orderData, message);

    expect(message.ack).toHaveBeenCalled();
});