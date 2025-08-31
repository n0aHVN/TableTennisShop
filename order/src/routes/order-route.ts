import express from "express";
import {  CheckAuthorizedMiddleware, CurrentUserMiddleware, ValidateRequestMiddleware } from "@tabletennisshop/common";
import { OrderController } from "../controller/order.controller";

const router = express.Router();

router.get("/api/orders", CheckAuthorizedMiddleware, CurrentUserMiddleware, OrderController.getOrders);

router.get("/api/orders/:id", CheckAuthorizedMiddleware, CurrentUserMiddleware, OrderController.getOrderById);

router.patch("/api/orders/:id", CheckAuthorizedMiddleware, CurrentUserMiddleware, OrderController.updateOrderValidator, ValidateRequestMiddleware, OrderController.updateOrder);

router.post("/api/orders", CheckAuthorizedMiddleware, CurrentUserMiddleware, OrderController.createOrderValidator, ValidateRequestMiddleware, OrderController.createOrder);

export { router as orderRouter };