import { InventoryCreatedListener } from "../InventoryCreatedListener";
import { InventoryCreatedEventInterface } from "@tabletennisshop/common";
import { natsWrapper } from "../../../NatsWrapper";
import { InventoryModel } from "../../../models/inventory.model";
import mongoose from "mongoose";

describe("InventoryCreatedListener", () => {
  const setup = async () => {
    const listener = new InventoryCreatedListener(natsWrapper.client);

    // Create data for a new inventory
    const data: InventoryCreatedEventInterface["data"] = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      product_id: new mongoose.Types.ObjectId().toHexString(),
      total_quantity: 100,
      version: 0,
    };
    
    // Mock message object
    // @ts-ignore
    const msg = {
      ack: jest.fn(),
    };

    return { listener, data, msg };
  };

  it("creates a new inventory record", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    // Verify the inventory was created with the correct data
    const inventoryRecord = await InventoryModel.findOne({ _id: data._id });
    expect(inventoryRecord).toBeDefined();
    expect(inventoryRecord!.product_id.toHexString()).toEqual(data.product_id);
    expect(inventoryRecord!.total_quantity).toEqual(data.total_quantity);
    expect(inventoryRecord!.version).toEqual(data.version);
  });

  it("acks the message", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});