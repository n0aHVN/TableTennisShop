import { CartModel, ListenerAbstract, OrderAttrs, OrderCreatedEventInterface } from "@tabletennisshop/common";
import { queueGroupName } from "../queueGroupName";
import { SubjectsEnum } from "@tabletennisshop/common/build/enums/event-subject.enum";

export class OrderCreatedListeners extends ListenerAbstract<OrderCreatedEventInterface> {
    queueGroupName: string = queueGroupName;
    subject: SubjectsEnum.OrderCreated = SubjectsEnum.OrderCreated;

    async onMessage(data: OrderAttrs, msg: any): Promise<void> {
        console.log("OrderCreatedListeners: Order created event received", data);
        const cart = await CartModel.findOne({user_id: data.user_id});
        if (!cart) {
            throw new Error("Cart not found");
        }
        for (const productCart of cart.products) {
            const productOrder = data.products.find(product => product.product_id === productCart.product_id);
            if (productOrder && productCart.quantity >= productOrder.quantity) {
                productCart.quantity -= productOrder.quantity;
                await cart.save();
                msg.ack();
            }
        }

        msg.ack();
        throw new Error("Not all products were found in the cart or insufficient quantity");
        

    }
}