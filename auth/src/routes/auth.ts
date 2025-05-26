import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { body } from "express-validator";
import { config } from "../configs/env";
import { authenticateToken } from "../middlewares/auth_middleware";

const router = express.Router()

const validationRules = [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password").isLength({min: 4, max:20}).withMessage("Password must be 4-20 characters"),
]

router.post("./signup", validationRules, async (req: Request, res: Response)=>{
});