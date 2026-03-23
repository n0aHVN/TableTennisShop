import { ListenerAbstract, OrderCreatedEventInterface, OrderUpdatedEventInterface, SubjectsEnum } from "@tabletennisshop/common";
import { Message } from "node-nats-streaming";
import { OrderService } from "../../services/order.service";

export class OrderUpdatedListener extends ListenerAbstract<OrderUpdatedEventInterface> {
    subject: SubjectsEnum.OrderUpdated = SubjectsEnum.OrderUpdated;
    queueGroupName: string = this.queueGroupName;

    async onMessage(data: OrderUpdatedEventInterface["data"], msg: Message) {
        await OrderService.updateOrder(data);
        msg.ack();
    }
}