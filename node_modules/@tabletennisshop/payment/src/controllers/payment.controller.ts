import { Request, Response } from "express";
import { body, param } from "express-validator";
import { PaymentService } from "../services/payment.service";
import { ApiResponse } from "@tabletennisshop/common";
import { PaymentDoc } from "../models/payment.model";

export class PaymentController{
    static createPaymentValidator = [
        body('order_id').isMongoId().withMessage('Invalid order ID'),
        body('status').isIn(['pending', 'completed', 'failed']).withMessage('Invalid payment status'),
    ]

    static async createPayment(req: Request, res: Response<ApiResponse<PaymentDoc>>){
        const user_id = req.currentUser!._id;
        const { order_id,status  } = req.body;
        const payment = await PaymentService.createPayment({ user_id, order_id});
        res.status(201).json({
            statusCode: 201,
            data: payment,
            success: true
        });
    }
}