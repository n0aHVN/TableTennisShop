import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import cookieSession from "cookie-session";
import { NotFoundError, ValidateRequestMiddleware } from "@tabletennisshop/common";
import { Client } from "../../models/ClientModel";
import { Password } from "../../services/password";
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

router.post("/api/users/signin", 
    validationRules,
    ValidateRequestMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        const {email, password} = req.body;

        const client = await Client.findOne({
            email: email
        });
        
        if (!client) {
            throw new NotFoundError("Email or Password is incorrect!");
        }

        const isPasswordCorrect = await Password.compare(password, client.password);
        
        if (!isPasswordCorrect) {
            throw new NotFoundError("Email or Password is incorrect!");
        }

        const clientJwt = jwt.sign(
            {
                id: client.id,
                email: client.email,
            },
            "secretkey",
        );
        req.session = {
            jwt: clientJwt,
        };
        res.status(200).send("Sucessfully Sign In");
        return;
    }
);

export {router};