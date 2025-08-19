import express from 'express';
import jwt from 'jsonwebtoken';
const router = express.Router();

router.get("/api/cart/hello", async (req, res) => {
    res.status(200).send("Hello from Cart");
});

router.get("/api/cart/items", async (req, res) => {
    if (!req.session){
        throw new Error("Unauthorized");
    }

    const {jwt} = req.session;
    const decoded = jwt.decode(jwt);
    res.status(200).send({
        items: decoded
    });
});

export {router as cartRouter};