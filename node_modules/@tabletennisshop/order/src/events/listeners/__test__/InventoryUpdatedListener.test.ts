import { Types } from "mongoose";
import { InventoryAttrs, InventoryModel } from "../../../models/inventory.model";
import { InventoryUpdatedListener } from "../InventoryUpdatedListener"
import { InventoryUpdatedEventInterface } from "@tabletennisshop/common";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../NatsWrapper";

const setup = async () => {
    const listener = new InventoryUpdatedListener(natsWrapper.client);

    const inventory:InventoryAttrs = {
        _id: new Types.ObjectId().toHexString(),
        product_id: new Types.ObjectId().toHexString(),
        total_quantity: 10,
        version: 0
    }
    const inventoryDoc = await InventoryModel.build(inventory).save();

    const messageData: InventoryUpdatedEventInterface["data"] = {
        _id: inventoryDoc._id.toHexString(),
        product_id: inventoryDoc.product_id.toString(),
        total_quantity: inventoryDoc.total_quantity + 10,
        version: inventoryDoc.version + 1
    }
    //@ts-ignore
    const message:Message={
        ack: jest.fn(),
    }

    return { listener, message, messageData, inventoryDoc };
}

it('update the status of the order', async () => {
    const { listener, message, messageData, inventoryDoc } = await setup();

    await listener.onMessage(messageData, message);

    const updatedInventory = await InventoryModel.findOne(inventoryDoc._id);
    expect(updatedInventory).toBeDefined();
    console.log('inventoryDoc', inventoryDoc);
    console.log('updatedInventory', updatedInventory);

    console.log('inventoryDoc.version', inventoryDoc.version);
    console.log('updatedInventory!.version', updatedInventory!.version);
    expect(updatedInventory!.version).toEqual(inventoryDoc.version + 1);
});

it('acknowledge the message', async () => {
    const { listener, message, messageData, inventoryDoc } = await setup();

    await listener.onMessage(messageData, message);

    expect(message.ack).toHaveBeenCalled();
});