import { Request, Response } from "express";
import { body } from "express-validator";
import { ApiResponse } from "@tabletennisshop/common";
import { ImportService } from "../service/import.service";

export const createImportValidator = [
    body("product_id").notEmpty().isMongoId().withMessage("Valid product_id is required"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be a positive integer"),
    body("import_price").isFloat({ min: 0 }).withMessage("Import price must be a non-negative number"),
    body("item_codes").isArray({ min: 1 }).withMessage("item_codes must be a non-empty array"),
    body("item_codes.*").isString().notEmpty().withMessage("Each item_code must be a non-empty string"),
    body("supplier").optional().isString(),
    body("note").optional().isString(),
];

export const createImportController = async (req: Request, res: Response<ApiResponse>) => {
    const { product_id, quantity, import_price, item_codes, supplier, note } = req.body;

    const result = await ImportService.createImport({
        product_id,
        quantity,
        import_price,
        item_codes,
        supplier,
        note,
    });

    res.status(201).send({
        success: true,
        statusCode: 201,
        data: result,
    });
};
