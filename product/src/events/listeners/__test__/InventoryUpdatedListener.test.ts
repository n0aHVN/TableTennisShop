import { InventoryUpdatedListener } from "../InventoryUpdatedListener";
import { InventoryUpdatedEventInterface } from "@tabletennisshop/common";
import { natsWrapper } from "../../../NatsWrapper";
import { InventoryModel } from "../../../models/inventory.model";
import mongoose from "mongoose";
describe("InventoryUpdatedListener", () => {
  const setup = async () => {
    const listener = new InventoryUpdatedListener(natsWrapper.client);

    const inventory = await InventoryModel.build({
      _id: new mongoose.Types.ObjectId().toHexString(),
      product_id: "507f1f77bcf86cd799439012",
      total_quantity: 50,
      version: 0,
    }).save();

    const data: InventoryUpdatedEventInterface["data"] = {
      _id: inventory._id.toHexString(),
      product_id: inventory.product_id.toHexString(),
      total_quantity: inventory.total_quantity,
      version: inventory.version + 1,
    };
    // Mock message object
    // @ts-ignore
    const msg = {
      ack: jest.fn(),
    };

    return { listener, data, msg };
  };

  it("calls InventoryService.updateInventory with correct data", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedInventory = await InventoryModel.findOne({ _id: data._id, version: data.version });
    expect(updatedInventory).toBeDefined();
    console.log(updatedInventory);

  });

  it("acks the message", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});