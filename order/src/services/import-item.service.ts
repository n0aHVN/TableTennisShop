import { NotFoundError } from "@tabletennisshop/common";
import { ImportItemStatusEnum } from "@tabletennisshop/common";
import { ImportItemModel } from "../models/import-item.model";
import { Types } from "mongoose";

export class ImportItemService {
    static async createImportItem(data: {
        _id: string;
        import_id: string;
        product_id: string;
        item_code: string;
        import_price: number;
        status: ImportItemStatusEnum;
        version: number;
    }) {
        const item = ImportItemModel.build({
            ...data,
        });
        await item.save();
        return item;
    }

    static async updateImportItem(data: {
        _id: string;
        import_id: string;
        product_id: string;
        item_code: string;
        import_price: number;
        status: ImportItemStatusEnum;
        order_id?: string;
        sold_at?: string;
        version: number;
    }) {
        const item = await ImportItemModel.findOne({
            _id: data._id,
            version: data.version - 1
        });

        if (!item) {
            throw new NotFoundError("Import item not found");
        }

        item.status = data.status;
        item.order_id = data.order_id ? new Types.ObjectId(data.order_id) : undefined;
        item.sold_at = data.sold_at ? new Date(data.sold_at) : undefined;
        await item.save();
        return item;
    }

    static async getItemsByOrderId(order_id: string) {
        return ImportItemModel.find({ order_id });
    }
}
