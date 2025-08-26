import express, { Request, Response } from "express";
import { OrderService } from "../services/order-service";
import { ApiResponse, CurrentUserMiddleware, OrderStatusEnum } from "@tabletennisshop/common";
import { OrderCancelledPublisher } from "../events/publishers/OrderCancelledPublisher";
import { natsWrapper } from "../NatsWrapper";
import { OrderDoc } from "../models/order.model";
const router = express.Router();

router.get("/api/orders",CurrentUserMiddleware, async (req: Request, res: Response<ApiResponse<OrderDoc[]>>) => {
    const userId = req.currentUser?._id as string;
    const orders = await OrderService.getOrdersByUserId(userId);
    const response : ApiResponse<OrderDoc[]> = {
        success: true,
        statusCode: 200,
        data: orders
    }
    res.status(200).send(response);
});

router.get("/api/orders/:id",CurrentUserMiddleware, async (req: Request, res: Response<ApiResponse<OrderDoc>>) => {
    const orderId = req.params.id;
    const userId = req.currentUser?._id!;
    const order = await OrderService.getOrderById({ userId, order_id: orderId });
    res.status(200).send({
        success: true,
        statusCode: 200,
        data: order
    });
});

router.patch("/api/orders/:orderId/status", CurrentUserMiddleware, async (req: Request, res: Response<ApiResponse<OrderDoc>>) => {
    const orderId = req.params.orderId;
    const { status } = req.body;
    const userId = req.currentUser?._id as string;

    const order = await OrderService.getOrderById({ userId, order_id: orderId });
    if (!order) {
        throw new Error("Order not found");
    }

    order.status = status as OrderStatusEnum;
    if (status == "cancelled"){
        new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order._id,
            version: order.version
        });
    }
    res.status(200).send({
        success: true,
        statusCode: 200,
        data: order
    });
});

export {router as orderRouter}