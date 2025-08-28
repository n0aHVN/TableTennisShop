import { Request, Response } from "express";
import { InventoryService } from "../service/inventory.service";
import { ApiResponse } from "@tabletennisshop/common";
import { InventoryDoc } from "../models/inventory.model";
import { body, param } from "express-validator";

export const updateInventoryController = [
    param("id").isMongoId().withMessage("Invalid product ID"),
    body("quantity").isInt({min:1}).withMessage("Invalid quantity"),
    body("product_id").optional().isMongoId().withMessage("Invalid product ID"),
    body("total_quantity").optional().isInt({min:0}).withMessage("Invalid total quantity"),
    async (req: Request, res: Response<ApiResponse<InventoryDoc>>) => {
    const {id: _id} = req.params;
    const { product_id, total_quantity } = req.body;
    const updatedInventory = await InventoryService.updateInventory({ _id, product_id, total_quantity });
    return res.status(200).send({
        statusCode: 200,
        data: updatedInventory,
        success: true
    });
}]