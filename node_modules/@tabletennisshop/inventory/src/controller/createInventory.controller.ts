import { NextFunction, Request, Response } from "express";
import { InventoryService } from "../service/inventory.service";
import { body } from "express-validator";
import { InventoryDoc } from "../models/inventory.model";
import { ApiResponse } from "@tabletennisshop/common/build/types/base";

export const createInventoryValidator = [
    body("product_id").notEmpty().withMessage("Product ID is required"),
    body("total_quantity").isInt({ min: 0 }).withMessage("Total quantity must be a positive integer")
]

export const createInventoryController = async (req: Request, res: Response<ApiResponse<InventoryDoc>>) => {
    const { product_id, total_quantity } = req.body;
    console.log("Total quantity:", total_quantity);
    const inventory = await InventoryService.createInventory({ product_id, total_quantity });
    res.status(201).send({
        data: inventory,
        statusCode: 201,
        success: true
    });
};