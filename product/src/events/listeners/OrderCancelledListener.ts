import { ListenerAbstract, OrderCancelledEventInterface } from "@tabletennisshop/common";
import { SubjectsEnum } from "@tabletennisshop/common/build/enums/event-subject.enum";
import { queueGroupName } from "../queueGroupName";
import { Message } from "node-nats-streaming";
import { InventoryService } from "../../services/inventory.service";

export class OrderCancelledListener extends ListenerAbstract<OrderCancelledEventInterface>{
    subject: SubjectsEnum.OrderCancelled = SubjectsEnum.OrderCancelled;
    queueGroupName: string = queueGroupName;
    async onMessage(data: OrderCancelledEventInterface['data'], msg: Message): Promise<void> {
        try {
            console.log("Order cancelled:", data);
            await Promise.all(data.products.map((product) => {
                return InventoryService.addInventory({product_id: product.product_id.toString(), quantity: product.quantity});
            }));
            msg.ack();
        } catch (error) {
            console.error("Error processing order cancelled event:", error);
        }
    }

}