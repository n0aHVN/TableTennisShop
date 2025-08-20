import express, { Request, Response } from "express";
import { OrderService } from "../services/order-service";
import { ApiResponse, CurrentUserMiddleware, OrderDoc, OrderStatusEnum } from "@tabletennisshop/common";
import { OrderCancelledPublisher } from "../events/publishers/OrderCancelledPublisher";
import { SubjectsEnum } from "@tabletennisshop/common/build/enums/event-subject.enum";
import { natsWrapper } from "../NatsWrapper";
const router = express.Router();

router.get("/api/orders",CurrentUserMiddleware, async (req: Request, res: Response<ApiResponse<OrderDoc[]|null>>) => {
    const userId = req.currentUser?._id as string;
    const orders = await OrderService.getOrdersByUserId(userId);
    res.status(200).send({
        success: true,
        statusCode: 200,
        data: orders
    });
});

router.get("/api/orders/:id",CurrentUserMiddleware, async (req: Request, res: Response<ApiResponse<OrderDoc | null>>) => {
    const orderId = req.params.id;
    const userId = req.currentUser?._id as string;
    const order = await OrderService.getOrderByUserId({ user_id: userId, order_id: orderId });
    if (!order) {
        throw new Error("Order not found");
    }
    res.status(200).send({
        success: true,
        statusCode: 200,
        data: order
    });
});

router.patch("/api/orders/:orderId/status", CurrentUserMiddleware, async (req: Request, res: Response<ApiResponse<OrderDoc | null>>) => {
    const orderId = req.params.orderId;
    const userId = req.currentUser?._id as string;
    const { status } = req.body;
    
    const order = await OrderService.getOrderByUserId({ user_id: userId, order_id: orderId });
    if (!order) {
        throw new Error("Order not found");
    }

    order.status = status as OrderStatusEnum;
    if (status == "cancelled"){
        new OrderCancelledPublisher(natsWrapper.client).publish(order);
    }
    res.status(200).send({
        success: true,
        statusCode: 200,
        data: order
    });
});

export {router as orderRouter}