import { ListenerAbstract, OrderCreatedEventInterface, SubjectsEnum } from "@tabletennisshop/common";
import { Message } from "node-nats-streaming";
import { OrderService } from "../../services/order.service";

export class OrderCreatedListener extends ListenerAbstract<OrderCreatedEventInterface> {
    subject: SubjectsEnum.OrderCreated = SubjectsEnum.OrderCreated;
    queueGroupName: string = this.queueGroupName;

    async onMessage(data: OrderCreatedEventInterface["data"], msg: Message) {
        await OrderService.createOrder(data);
        msg.ack();
    }
}