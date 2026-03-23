import { InventoryUpdatedEventInterface, ListenerAbstract, ProductUpdatedEventInterface, SubjectsEnum } from "@tabletennisshop/common";
import { queueGroupName } from "../queueGroupName";
import { InventoryService } from "../../services/inventory.service";
import { ProductService } from "../../services/product.service";

/* When inventory is updated
* update the inventory
*/

export class ProductUpdatedListener extends ListenerAbstract<ProductUpdatedEventInterface>{
    subject: ProductUpdatedEventInterface['subject'] = SubjectsEnum.ProductUpdated;
    queueGroupName: string = queueGroupName;
    async onMessage(data: ProductUpdatedEventInterface['data'], msg: any) {
        await ProductService.updateProduct({
            _id: data._id,
            status: data.status,
            price: data.price
        });
        msg.ack();
    }
}