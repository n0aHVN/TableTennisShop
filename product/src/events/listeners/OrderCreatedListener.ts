import { ListenerAbstract, OrderCreatedEventInterface } from "@tabletennisshop/common";
import { SubjectsEnum } from "@tabletennisshop/common/build/enums/event-subject.enum";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "../queueGroupName";
import { InventoryService } from "../../services/inventory.service";

export class OrderCreatedListener extends ListenerAbstract<OrderCreatedEventInterface>{
    subject: SubjectsEnum.OrderCreated = SubjectsEnum.OrderCreated;
    queueGroupName: string = queueGroupName;
    async onMessage(data: OrderCreatedEventInterface['data'], msg: Message): Promise<void> {
        try {
            await Promise.all(data.products.map((product) => {
                return InventoryService.buyInventory({product_id: product.product_id.toString(), quantity: product.quantity});
            }));
            msg.ack();
        } catch (error) {
            console.error("Error processing order created event:", error);
        }
    }
}