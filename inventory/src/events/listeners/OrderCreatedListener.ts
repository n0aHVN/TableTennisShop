import { ListenerAbstract, OrderCreatedEventInterface, SubjectsEnum } from "@tabletennisshop/common";
import { queueGroupName } from "../queueGroupName";
import { InventoryService } from "../../service/inventory.service";
import { ImportService } from "../../service/import.service";

export class OrderCreatedListener extends ListenerAbstract<OrderCreatedEventInterface>{
    subject: SubjectsEnum.OrderCreated = SubjectsEnum.OrderCreated;
    queueGroupName: string = queueGroupName;
    async onMessage(data: OrderCreatedEventInterface["data"], msg: any): Promise<void> {
        await Promise.all(
            data.products.map(async product => {
                await ImportService.assignItemsFIFO(
                    product.product_id,
                    product.quantity,
                    data._id
                );

                const inventoryId = await InventoryService.getInventoryIdByProductId(product.product_id);
                await InventoryService.subtractQuantity({ quantity: product.quantity, inventory_id: inventoryId });
            })
        );
        msg.ack();
    }
}