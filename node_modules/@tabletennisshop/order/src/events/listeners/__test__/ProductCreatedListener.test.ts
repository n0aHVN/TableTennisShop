import { Types } from "mongoose";
import { ProductModel } from "../../../models/product.model";
import { ProductCreatedListener } from "../ProductCreatedListener";
import { ProductCreatedEventInterface, ProductStatusEnum } from "@tabletennisshop/common";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../NatsWrapper";

const setup = async () => {
    const listener = new ProductCreatedListener(natsWrapper.client);

    const messageData: ProductCreatedEventInterface["data"] = {
        _id: new Types.ObjectId().toHexString(),
        price: 200,
        status: ProductStatusEnum.ENABLE,
        version: 0
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return { listener, message, messageData };
};

it("creates and saves a product", async () => {
    const { listener, message, messageData } = await setup();

    await listener.onMessage(messageData, message);

    const product = await ProductModel.findById(messageData._id);

    expect(product).toBeDefined();
    expect(product!.price).toEqual(messageData.price);
    expect(product!.status).toEqual(messageData.status);
    expect(product!.version).toEqual(messageData.version);
});

it("acknowledges the message", async () => {
    const { listener, message, messageData } = await setup();

    await listener.onMessage(messageData, message);

    expect(message.ack).toHaveBeenCalled();
});
