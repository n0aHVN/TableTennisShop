import { Types } from "mongoose";
import { SubjectsEnum } from "../enums/event-subject.enum";

interface InventoryAttrs{
    _id: string;
    product_id: string;
    total_quantity: number;
    version: number;
}

export interface InventoryUpdatedEventInterface{
    subject: SubjectsEnum.InventoryUpdated;
    data: InventoryAttrs;
}
export interface InventoryCreatedEventInterface{
    subject: SubjectsEnum.InventoryCreated;
    data: InventoryAttrs;
}
export interface InventoryDeleteEventInterface{
    subject: SubjectsEnum.InventoryDeleted;
    data: InventoryAttrs;
}
    