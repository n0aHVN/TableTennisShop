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

        await cart.deleteOne();
        msg.ack();
    }
}