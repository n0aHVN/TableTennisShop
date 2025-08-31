import { Types } from "mongoose";
import { ProductModel } from "../../../models/product.model";
import { ProductUpdatedListener } from "../ProductUpdatedListener";
import { ProductUpdatedEventInterface, ProductStatusEnum, OrderStatusEnum } from "@tabletennisshop/common";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../NatsWrapper";

const setup = async () => {
    const listener = new ProductUpdatedListener(natsWrapper.client);

    const product: ProductUpdatedEventInterface["data"] = {
        _id: new Types.ObjectId().toHexString(),
        price: 100,
        status: ProductStatusEnum.ENABLE,
        version: 0
    };
    const productDoc = await new ProductModel(product).save();

    const messageData: ProductUpdatedEventInterface["data"] = {
        _id: productDoc._id.toHexString(),
        price: 150,
        status: ProductStatusEnum.DISABLE,
        version: productDoc.version + 1
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return { listener, message, messageData, productDoc };
};

it("updates the product", async () => {
    const { listener, message, messageData, productDoc } = await setup();

    await listener.onMessage(messageData, message);
    const updatedProduct = await ProductModel.findById(productDoc._id);
    console.log('productDoc', productDoc);
    console.log('updatedProduct', updatedProduct);
    expect(updatedProduct).toBeDefined();
    expect(updatedProduct!.price).toEqual(messageData.price);
    expect(updatedProduct!.status).toEqual(messageData.status);
    expect(updatedProduct!.version).toEqual(messageData.version);
});
it("acknowledges the message", async () => {
    const { listener, message, messageData } = await setup();

    await listener.onMessage(messageData, message);

    expect(message.ack).toHaveBeenCalled();
});