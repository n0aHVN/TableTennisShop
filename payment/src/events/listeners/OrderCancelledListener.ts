import { ListenerAbstract, OrderCancelledEventInterface, OrderCreatedEventInterface, OrderUpdatedEventInterface, SubjectsEnum } from "@tabletennisshop/common";
import { Message } from "node-nats-streaming";
import { OrderService } from "../../services/order.service";

export class OrderCancelledListener extends ListenerAbstract<OrderCancelledEventInterface> {
    subject: SubjectsEnum.OrderCancelled = SubjectsEnum.OrderCancelled;
    queueGroupName: string = this.queueGroupName;

    async onMessage(data: OrderCancelledEventInterface["data"], msg: Message) {
        await OrderService.cancelOrder(data);
        msg.ack();
    }
}