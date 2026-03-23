import { Types } from "mongoose";
import { OrderUpdatedListener } from "../OrderUpdatedListener";
import { OrderUpdatedEventInterface, OrderStatusEnum, PaymentMethodEnum } from "@tabletennisshop/common";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../NatsWrapper";
import { OrderModel } from "../../../models/order.model";

const setup = async () => {
    const listener = new OrderUpdatedListener(natsWrapper.client);

    // Create and save an initial order
    const order = await OrderModel.build({
        _id: new Types.ObjectId().toHexString(),
        user_id: new Types.ObjectId().toHexString(),
        status: OrderStatusEnum.PENDING,
        total_price: 1000,
        payment_method: PaymentMethodEnum.BANKING,
        products: [
            {
                product_id: new Types.ObjectId().toHexString(),
                quantity: 1,
                price: 1000
            }
        ],
        version: 0
    }).save();

    const updateData: OrderUpdatedEventInterface["data"] = {
        _id: order._id.toString(),
        user_id: order.user_id.toString(),
        status: OrderStatusEnum.FINISHED,
        total_price: 2000,
        payment_method: PaymentMethodEnum.COD,
        products: [
            {
                product_id: new Types.ObjectId().toHexString(),
                quantity: 2,
                price: 2000,
                item_codes: []
            }
        ],
        version: order.version + 1
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return { listener, updateData, message, order };
};

it("updates and saves an order", async () => {
    const { listener, updateData, message, order } = await setup();

    await listener.onMessage(updateData, message);

    const updatedOrder = await OrderModel.findById(order._id);
    expect(updatedOrder).toBeDefined();
    expect(updatedOrder!.total_price).toBe(updateData.total_price);
    expect(updatedOrder!.status).toBe(updateData.status);
    expect(updatedOrder!.payment_method).toBe(updateData.payment_method);
    expect(updatedOrder!.version).toBe(updateData.version);
});

it("acknowledges the message", async () => {
    const { listener, updateData, message } = await setup();

    await listener.onMessage(updateData, message);

    expect(message.ack).toHaveBeenCalled();
});
