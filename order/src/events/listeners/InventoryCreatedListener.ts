import { InventoryCreatedEventInterface, InventoryUpdatedEventInterface, ListenerAbstract, SubjectsEnum } from "@tabletennisshop/common";
import { queueGroupName } from "../queueGroupName";
import { InventoryService } from "../../services/inventory.service";

/* When inventory is updated
* we need to update the product status if the inventory is empty
*/

export class InventoryCreatedListener extends ListenerAbstract<InventoryCreatedEventInterface>{
    subject: InventoryCreatedEventInterface['subject'] = SubjectsEnum.InventoryCreated;
    queueGroupName: string = queueGroupName;
    async onMessage(data: InventoryCreatedEventInterface['data'], msg: any) {
        await InventoryService.createInventory({
            _id: data._id,
            product_id: data.product_id,
            quantity: data.total_quantity,
            version: data.version
        });
        msg.ack();
    }
}