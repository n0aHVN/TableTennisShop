import { ListenerAbstract, OrderCancelledEventInterface, SubjectsEnum } from "@tabletennisshop/common";
import { queueGroupName } from "../queueGroupName";
import { InventoryService } from "../../service/inventory.service";
import { ImportService } from "../../service/import.service";

export class OrderCancelledListener extends ListenerAbstract<OrderCancelledEventInterface>{
    subject: SubjectsEnum.OrderCancelled = SubjectsEnum.OrderCancelled;
    queueGroupName: string = queueGroupName;
    async onMessage(data: OrderCancelledEventInterface["data"], msg: any): Promise<void> {
        await ImportService.releaseItemsByOrderId(data._id);

        await Promise.all(
            data.products.map(async product => {
                const inventoryId = await InventoryService.getInventoryIdByProductId(product.product_id);
                await InventoryService.addQuantity({ quantity: product.quantity, inventory_id: inventoryId });
            })
        );
        msg.ack();
    }
}