import { Types } from "mongoose";
import { ProductCreatedListener } from "../ProductCreatedListener";
import { ProductCreatedEventInterface, ProductStatusEnum } from "@tabletennisshop/common";
import { Message } from "node-nats-streaming";
import { InventoryModel } from "../../../models/inventory.model";
import { natsWrapper } from "../../../NatsWrapper";

const setup = async () => {
    const listener = new ProductCreatedListener(natsWrapper.client);

    const messageData: ProductCreatedEventInterface["data"] = {
        _id: new Types.ObjectId().toHexString(),
        price: 100,
        status: ProductStatusEnum.OUT_OF_STOCK,
        version: 0
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return { listener, message, messageData };
};

it("creates a new inventory record with product_id and total_quantity = 0", async () => {
    const { listener, message, messageData } = await setup();

    await listener.onMessage(messageData, message);

    const inventory = await InventoryModel.findOne({ product_id: messageData._id });

    expect(inventory).toBeDefined();
    expect(inventory!.product_id.toHexString()).toEqual(messageData._id);
    expect(inventory!.total_quantity).toEqual(0);
});

it("acknowledges the message", async () => {
    const { listener, message, messageData } = await setup();

    await listener.onMessage(messageData, message);

    expect(message.ack).toHaveBeenCalled();
});