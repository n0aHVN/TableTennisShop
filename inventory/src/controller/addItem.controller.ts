import { Request, Response } from "express";
import { body, param } from "express-validator";
import { addQuantityService } from "../service/addQuantity.service";
import { ApiResponse } from "@tabletennisshop/common";

export const addQuantityController =  [
    param("id").isMongoId().withMessage("Invalid product ID"),
    body("quantity").isInt({min:1}).withMessage("Invalid quantity"),
    async (req: Request, res: Response)=>{
        const {id: product_id} = req.params;
        const {quantity} = req.body;

        // Add item to inventory
        const result = await addQuantityService({product_id, quantity});
        
        const response: ApiResponse = {
            statusCode: 200, 
            data: result,
            success: true
        }
        res.status(200).json(response);
    },
]