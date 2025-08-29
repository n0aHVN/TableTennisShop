import { ListenerAbstract, OrderCreatedEventInterface, SubjectsEnum } from "@tabletennisshop/common";
import { queueGroupName } from "../queueGroupName";
import { InventoryService } from "../../service/inventory.service";

export class OrderCreatedListener extends ListenerAbstract<OrderCreatedEventInterface>{
    subject: SubjectsEnum.OrderCreated = SubjectsEnum.OrderCreated;
    queueGroupName: string = queueGroupName;
    async onMessage(data: OrderCreatedEventInterface["data"], msg: any): Promise<void> {
        // Do not use foreach in this, because we can't await inside a foreach, lead to msg.ack() being called before all promises resolve
        //  Use Promise.all instead
        await Promise.all(
        data.products.map(async product =>{
            const inventoryId = await InventoryService.getInventoryIdByProductId(product.product_id);
            await InventoryService.subtractQuantity({quantity: product.quantity, inventory_id: inventoryId});
            })
        );
        msg.ack(); // 👈 Runs after all promises resolve
    }
}