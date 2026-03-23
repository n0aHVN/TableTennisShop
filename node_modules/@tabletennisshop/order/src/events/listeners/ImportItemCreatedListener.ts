import { ListenerAbstract, ImportItemCreatedEventInterface, SubjectsEnum } from "@tabletennisshop/common";
import { queueGroupName } from "../queueGroupName";
import { ImportItemService } from "../../services/import-item.service";

export class ImportItemCreatedListener extends ListenerAbstract<ImportItemCreatedEventInterface> {
    subject: SubjectsEnum.ImportItemCreated = SubjectsEnum.ImportItemCreated;
    queueGroupName: string = queueGroupName;

    async onMessage(data: ImportItemCreatedEventInterface["data"], msg: any): Promise<void> {
        await ImportItemService.createImportItem({
            _id: data._id,
            import_id: data.import_id,
            product_id: data.product_id,
            item_code: data.item_code,
            import_price: data.import_price,
            status: data.status,
            version: data.version,
        });
        msg.ack();
    }
}
