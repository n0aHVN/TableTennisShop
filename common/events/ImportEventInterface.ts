import { SubjectsEnum } from "../enums/event-subject.enum";
import { ImportItemStatusEnum } from "../enums/import-item-status.enum";

interface ImportAttrs {
    _id: string;
    product_id: string;
    quantity: number;
    import_price: number;
    supplier?: string;
    note?: string;
    version: number;
}

interface ImportItemAttrs {
    _id: string;
    import_id: string;
    product_id: string;
    item_code: string;
    import_price: number;
    status: ImportItemStatusEnum;
    order_id?: string;
    sold_at?: string;
    version: number;
}

export interface ImportCreatedEventInterface {
    subject: SubjectsEnum.ImportCreated;
    data: ImportAttrs;
}

export interface ImportItemCreatedEventInterface {
    subject: SubjectsEnum.ImportItemCreated;
    data: ImportItemAttrs;
}

export interface ImportItemUpdatedEventInterface {
    subject: SubjectsEnum.ImportItemUpdated;
    data: ImportItemAttrs;
}
