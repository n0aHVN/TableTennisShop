import { Types } from "mongoose";
import { OrderCreatedListener } from "../OrderCreatedListener";
import { OrderCreatedEventInterface, OrderStatusEnum, PaymentMethodEnum } from "@tabletennisshop/common";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../NatsWrapper";
import { InventoryService } from "../../../service/inventory.service";
import { InventoryModel } from "../../../models/inventory.model";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);
    const inventoryDoc = await global.addInventory();
    const orderData: OrderCreatedEventInterface["data"] = {
        _id: new Types.ObjectId().toHexString(),
        user_id: new Types.ObjectId().toHexString(),
        status: OrderStatusEnum.PENDING,
        total_price: 1000,
        payment_method: PaymentMethodEnum.BANKING,
        version: 0,
        products:[{
            price: 100,
            product_id: inventoryDoc.product_id.toHexString(),
            quantity: 3
        }],
        expiresAt: new Date(Date.now() + 1000 * 60).toISOString()
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return { listener, orderData, message, inventoryDoc };
};

it("listen to ordercreated and subject quantity", async () => {
    const { listener, orderData, message, inventoryDoc } = await setup();
    await listener.onMessage(orderData, message);
    const updatedInventory = await InventoryModel.findById(inventoryDoc._id);
    expect(updatedInventory).toBeDefined();
    expect(updatedInventory!.total_quantity).toBe(inventoryDoc.total_quantity - orderData.products[0].quantity);
    expect(updatedInventory?.version).toBe(inventoryDoc.version + 1);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("acknowledges the message", async () => {
    const { listener, orderData, message } = await setup();

    await listener.onMessage(orderData, message);

    expect(message.ack).toHaveBeenCalled();
});