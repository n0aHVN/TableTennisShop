import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { body } from "express-validator";
import { config } from "../configs/env";
import { authenticateToken } from "../middlewares/auth_middleware";

const router = express.Router()
const users = [{ id: "1", email: "admin@mail.com", password: bcrypt.hashSync("password", 10) }];
const validationRules = [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password").isLength({min: 4, max:20}).withMessage("Password must be 4-20 characters"),
]

router.post("/signup", validationRules, async (req: Request, res: Response) =>{
    const {email, password} = req.body;
    const user = await users.find((u) => u.email === email);
    if (!user){
        res.status(201).send({message:"User not found"});
        return;
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch){
        res.status(401).json({ message: "Invalid credentials" });
        return;
    }

    const token = jwt.sign(
        { username: user.id, email: user.email }, 
        config.jwtSecret, 
        { expiresIn: "900s"}
    );
    res.cookie("jwt", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production", // Set secure in production
        maxAge: Number(config.jwtExpiresIn) * 1000, // Convert seconds to milliseconds
      });
    res.status(200).json({ message: "Signed in successfully" });
    return;
});