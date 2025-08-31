import { ListenerAbstract, ProductCreatedEventInterface, SubjectsEnum } from "@tabletennisshop/common";
import { queueGroupName } from "../queueGroupName";
import { ProductService } from "../../services/product.service";

/*
 * When a product is created,
 * add the product to the local database.
 */
export class ProductCreatedListener extends ListenerAbstract<ProductCreatedEventInterface> {
    subject: ProductCreatedEventInterface['subject'] = SubjectsEnum.ProductCreated;
    queueGroupName: string = queueGroupName;

    async onMessage(data: ProductCreatedEventInterface['data'], msg: any) {
        await ProductService.createProduct({
            _id: data._id,
            price: data.price,
            status: data.status,
            version: data.version
        });
        msg.ack();
    }
}