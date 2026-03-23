import { ListenerAbstract, ImportItemUpdatedEventInterface, SubjectsEnum } from "@tabletennisshop/common";
import { queueGroupName } from "../queueGroupName";
import { ImportItemService } from "../../services/import-item.service";

export class ImportItemUpdatedListener extends ListenerAbstract<ImportItemUpdatedEventInterface> {
    subject: SubjectsEnum.ImportItemUpdated = SubjectsEnum.ImportItemUpdated;
    queueGroupName: string = queueGroupName;

    async onMessage(data: ImportItemUpdatedEventInterface["data"], msg: any): Promise<void> {
        await ImportItemService.updateImportItem({
            _id: data._id,
            import_id: data.import_id,
            product_id: data.product_id,
            item_code: data.item_code,
            import_price: data.import_price,
            status: data.status,
            order_id: data.order_id,
            sold_at: data.sold_at,
            version: data.version,
        });
        msg.ack();
    }
}
