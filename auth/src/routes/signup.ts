import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { Client, ClientAttrs } from "../../models/ClientModel";
import { ValidateRequestMiddleware } from "@tabletennisshop/common";


const router = express.Router();

const validationRules = [
    body("email").notEmpty()
                .withMessage("Email is required")
                .isEmail()
                .withMessage("Email must be a valid email address"),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 4, max: 20 })
        .withMessage("Password must be between 4 and 20 characters"),
]
router.post("/api/users/signup",
    validationRules,
    ValidateRequestMiddleware,
    async (req: Request, res: Response)=>{
        const {
            email,
            password,
            full_name,
            address,
            province,
            district,
            ward,
            phone_number
        } = req.body;
        const client = new Client({
            email,
            password,
            full_name,
            address,
            province,
            district,
            ward,
            phone_number
        });
        
        await client.save();
        console.log(client);
        res.status(200).send({
            message: "User is successfully created"
        });
    }
)

export {router};