import { InventoryUpdatedEventInterface, ListenerAbstract, SubjectsEnum } from "@tabletennisshop/common";
import { queueGroupName } from "../queueGroupName";
import { InventoryService } from "../../services/inventory.service";

/* When inventory is updated
* update the inventory
*/

export class InventoryUpdatedListener extends ListenerAbstract<InventoryUpdatedEventInterface>{
    subject: InventoryUpdatedEventInterface['subject'] = SubjectsEnum.InventoryUpdated;
    queueGroupName: string = queueGroupName;
    async onMessage(data: InventoryUpdatedEventInterface['data'], msg: any) {
        await InventoryService.updateInventory({
            _id: data._id,
            product_id: data.product_id,
            quantity: data.total_quantity,
            version: data.version
        });
        msg.ack();
    }
}