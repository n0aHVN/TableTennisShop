import { ListenerAbstract, ProductCreatedEventInterface, SubjectsEnum } from "@tabletennisshop/common";
import { queueGroupName } from "../queueGroupName";
import { InventoryModel } from "../../models/inventory.model";
import { InventoryService } from "../../service/inventory.service";

/*
 * When a product is created,
 * create a new inventory record with product_id and total_quantity = 0.
 */
export class ProductCreatedListener extends ListenerAbstract<ProductCreatedEventInterface> {
    subject: ProductCreatedEventInterface['subject'] = SubjectsEnum.ProductCreated;
    queueGroupName: string = queueGroupName;

    async onMessage(data: ProductCreatedEventInterface['data'], msg: any) {
        await InventoryService.addInventory({
            product_id: data._id,
            quantity: 0
        });
        msg.ack();
    }
}