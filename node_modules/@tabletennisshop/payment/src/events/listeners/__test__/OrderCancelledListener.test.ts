import { Types } from "mongoose";
import { OrderUpdatedListener } from "../OrderUpdatedListener";
import { OrderUpdatedEventInterface, OrderStatusEnum, PaymentMethodEnum, OrderCancelledEventInterface } from "@tabletennisshop/common";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../NatsWrapper";
import { OrderModel } from "../../../models/order.model";
import { OrderCancelledListener } from "../OrderCancelledListener";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

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

    const cancelledData: OrderCancelledEventInterface["data"] = {
        _id: order._id.toString(),
        version: order.version + 1,
        payment_method: order.payment_method,
        products: order.products.map(product => ({
            product_id: product.product_id.toHexString(),
            quantity: product.quantity,
            price: product.price,
            item_codes: []
        })),
        status: OrderStatusEnum.CANCELLED,
        total_price: order.total_price,
        user_id: order.user_id.toHexString(),
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return { listener, cancelledData, message, order };
};

it("updates and saves an order", async () => {
    const { listener, cancelledData, message, order } = await setup();

    await listener.onMessage(cancelledData, message);

    const updatedOrder = await OrderModel.findById(order._id);
    expect(updatedOrder).toBeDefined();
    expect(updatedOrder!.status).toBe(OrderStatusEnum.CANCELLED);
    expect(updatedOrder!.version).toBe(cancelledData.version);
});

it("acknowledges the message", async () => {
    const { listener, cancelledData, message } = await setup();

    await listener.onMessage(cancelledData, message);

    expect(message.ack).toHaveBeenCalled();
});
