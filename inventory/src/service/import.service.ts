import { BadRequestError, ImportItemStatusEnum, NotFoundError } from "@tabletennisshop/common";
import { ImportModel } from "../models/import.model";
import { ImportItemDoc, ImportItemModel } from "../models/import-item.model";
import { InventoryService } from "./inventory.service";
import { ImportItemCreatedPublisher } from "../events/publisher/ImportItemCreatedPublisher";
import { ImportItemUpdatedPublisher } from "../events/publisher/ImportItemUpdatedPublisher";
import { natsWrapper } from "../NatsWrapper";

interface CreateImportParams {
    product_id: string;
    quantity: number;
    import_price: number;
    supplier?: string;
    note?: string;
    item_codes: string[];
}

export class ImportService {
    static async createImport(data: CreateImportParams) {
        if (data.item_codes.length !== data.quantity) {
            throw new BadRequestError(
                `item_codes length (${data.item_codes.length}) must match quantity (${data.quantity})`
            );
        }

        const duplicates = await ImportItemModel.find({
            item_code: { $in: data.item_codes }
        });
        if (duplicates.length > 0) {
            const codes = duplicates.map(d => d.item_code).join(', ');
            throw new BadRequestError(`Duplicate item codes: ${codes}`);
        }

        const importDoc = ImportModel.build({
            product_id: data.product_id,
            quantity: data.quantity,
            import_price: data.import_price,
            supplier: data.supplier,
            note: data.note,
        });
        await importDoc.save();

        const importItems: ImportItemDoc[] = [];
        for (const code of data.item_codes) {
            const item = ImportItemModel.build({
                import_id: importDoc._id.toHexString(),
                product_id: data.product_id,
                item_code: code,
                import_price: data.import_price,
            });
            await item.save();
            importItems.push(item);

            await new ImportItemCreatedPublisher(natsWrapper.client).publish({
                _id: item._id.toHexString(),
                import_id: item.import_id.toHexString(),
                product_id: item.product_id.toHexString(),
                item_code: item.item_code,
                import_price: item.import_price,
                status: item.status,
                version: item.version,
            });
        }

        const inventoryId = await InventoryService.getInventoryIdByProductId(data.product_id);
        await InventoryService.addQuantity({ quantity: data.quantity, inventory_id: inventoryId });

        return { import: importDoc, items: importItems };
    }

    static async getImportItemsByProductId(product_id: string) {
        return ImportItemModel.find({ product_id }).sort({ createdAt: 1 });
    }

    static async getAvailableItemsByProductId(product_id: string) {
        return ImportItemModel.find({
            product_id,
            status: ImportItemStatusEnum.IN_STOCK
        }).sort({ createdAt: 1 });
    }

    static async getImportItemByCode(item_code: string) {
        const item = await ImportItemModel.findOne({ item_code });
        if (!item) {
            throw new NotFoundError(`Import item not found: ${item_code}`);
        }
        return item;
    }

    /**
     * FIFO assignment: marks the oldest in-stock items as sold for an order.
     * Returns the assigned item_codes.
     */
    static async assignItemsFIFO(product_id: string, quantity: number, order_id: string): Promise<string[]> {
        const availableItems = await ImportItemModel.find({
            product_id,
            status: ImportItemStatusEnum.IN_STOCK
        }).sort({ createdAt: 1 }).limit(quantity);

        if (availableItems.length < quantity) {
            throw new BadRequestError(
                `Not enough stock: need ${quantity}, available ${availableItems.length}`
            );
        }

        const assignedCodes: string[] = [];
        for (const item of availableItems) {
            item.status = ImportItemStatusEnum.SOLD;
            item.order_id = order_id as any;
            item.sold_at = new Date();
            await item.save();
            assignedCodes.push(item.item_code);

            await new ImportItemUpdatedPublisher(natsWrapper.client).publish({
                _id: item._id.toHexString(),
                import_id: item.import_id.toHexString(),
                product_id: item.product_id.toHexString(),
                item_code: item.item_code,
                import_price: item.import_price,
                status: item.status,
                order_id: item.order_id?.toHexString(),
                sold_at: item.sold_at?.toISOString(),
                version: item.version,
            });
        }

        return assignedCodes;
    }

    /**
     * Release items back to in_stock (e.g. on order cancellation).
     */
    static async releaseItemsByOrderId(order_id: string): Promise<void> {
        const soldItems = await ImportItemModel.find({
            order_id,
            status: ImportItemStatusEnum.SOLD
        });

        for (const item of soldItems) {
            item.status = ImportItemStatusEnum.IN_STOCK;
            item.order_id = undefined;
            item.sold_at = undefined;
            await item.save();

            await new ImportItemUpdatedPublisher(natsWrapper.client).publish({
                _id: item._id.toHexString(),
                import_id: item.import_id.toHexString(),
                product_id: item.product_id.toHexString(),
                item_code: item.item_code,
                import_price: item.import_price,
                status: item.status,
                version: item.version,
            });
        }
    }

    static async getImportsByProductId(product_id: string) {
        return ImportModel.find({ product_id }).sort({ createdAt: -1 });
    }
}
