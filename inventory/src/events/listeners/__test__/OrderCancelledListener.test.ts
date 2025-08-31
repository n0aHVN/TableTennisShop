import { Types } from "mongoose";
import { OrderCancelledListener } from "../OrderCancelledListener";
import { OrderCancelledEventInterface, OrderStatusEnum, PaymentMethodEnum } from "@tabletennisshop/common";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../NatsWrapper";
import { InventoryModel } from "../../../models/inventory.model";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);
    const inventoryDoc = await global.addInventory(); // Should create an inventory with a product_id and total_quantity

    // Simulate an order that previously subtracted quantity, now cancelling (so we add back)
    const orderData: OrderCancelledEventInterface["data"] = {
        _id: new Types.ObjectId().toHexString(),
        version: 1,
        products: [{
            product_id: inventoryDoc.product_id.toHexString(),
            price: 100,
            quantity: 10
        }],
        payment_method: PaymentMethodEnum.BANKING,
        total_price: 1000,
        user_id: new Types.ObjectId().toHexString(),
        status: OrderStatusEnum.CANCELLED,
        expiresAt: new Date().toISOString()
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return { listener, orderData, message, inventoryDoc };
};

it("listen to ordercancelled and adds quantity back", async () => {
    const { listener, orderData, message, inventoryDoc } = await setup();

    await listener.onMessage(orderData, message);

    const updatedInventory = await InventoryModel.findById(inventoryDoc._id);
    expect(updatedInventory).toBeDefined();
    expect(updatedInventory!.total_quantity).toBe(inventoryDoc.total_quantity + orderData.products[0].quantity);
    expect(updatedInventory?.version).toBe(inventoryDoc.version + 1);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("acknowledges the message", async () => {
    const { listener, orderData, message } = await setup();

    await listener.onMessage(orderData, message);

    expect(message.ack).toHaveBeenCalled();
});
