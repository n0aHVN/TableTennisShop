import { Request, Response } from "express";
import { InventoryService } from "../service/inventory.service";
import { ApiResponse } from "@tabletennisshop/common";
import { InventoryDoc } from "../models/inventory.model";

export const getInventoryByProductIdController = async (req: Request, res: Response<ApiResponse<InventoryDoc>>) => {
    const { id } = req.params;
    const inventory = await InventoryService.getInventoryByProductId(id);
    res.status(200).json({ success: true, data: inventory, statusCode: 200 });
}