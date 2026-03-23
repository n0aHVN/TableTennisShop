import { Types } from "mongoose";
import { OrderModel } from "../../../models/order.model";
import { PaymentCreatedListener } from "../PaymentCreatedListener";
import { PaymentCreatedEventInterface, OrderStatusEnum, PaymentMethodEnum } from "@tabletennisshop/common";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../NatsWrapper";

const setup = async () => {
    const listener = new PaymentCreatedListener(natsWrapper.client);

    // Create an order with PENDING status
    const order = OrderModel.build({
        user_id: new Types.ObjectId().toHexString(),
        products: [
            {
                product_id: new Types.ObjectId().toHexString(),
                price: 100,
                quantity: 2
            }
        ],
        status: OrderStatusEnum.PENDING,
        payment_method: PaymentMethodEnum.BANKING,
        total_price: 200,
        expiresAt: new Date(Date.now() + 1000 * 60) // 1 day from now
    });
    await order.save();

    const messageData: PaymentCreatedEventInterface["data"] = {
        _id: new Types.ObjectId().toHexString(),
        order_id: order._id.toHexString(),
        user_id: order.user_id.toHexString(),
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return { listener, message, messageData, order };
};

it("updates the order status to FINISHED", async () => {
    const { listener, message, messageData, order } = await setup();

    await listener.onMessage(messageData, message);
    
    const updatedOrder = await OrderModel.findById(order._id);
    
    expect(updatedOrder).toBeDefined();
    expect(updatedOrder!.status).toEqual(OrderStatusEnum.FINISHED);
});

it("acknowledges the message", async () => {
    const { listener, message, messageData } = await setup();

    await listener.onMessage(messageData, message);
    expect(message.ack).toHaveBeenCalled();
});