import { ApiResponse, CartDoc, CheckAuthorizedMiddleware, CurrentUserMiddleware, ICartAttrs } from '@tabletennisshop/common';
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { CartService } from '../service/cart-service';
const router = express.Router();

router.get("/api/cart/hello", async (req, res) => {
    res.status(200).send("Hello from Cart");
});

router.get("/api/cart/items", CheckAuthorizedMiddleware, CurrentUserMiddleware, async (req: Request, res: Response<ApiResponse<CartDoc|null>>) => {
    const userId = req.currentUser?._id as string;
    const cart = await CartService.getCartByUserId(userId);
    console.log("Cart items for user:", userId, cart);
    res.status(200).send({
        success: true,
        statusCode: 200,
        data: cart
    });
});

router.get("/api/cart/items/all", async (req, res) => {
    const carts = await CartService.getAllCarts();
    res.status(200).send({
        data: carts
    });
});

export {router as cartRouter};