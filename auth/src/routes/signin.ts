import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import cookieSession from "cookie-session";
import { NotFoundError, ValidateRequestMiddleware } from "@tabletennisshop/common";
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

let users: { email: string, password: string }[] = [{email: "superherodung123@gmail.com", password: "1234"}];
router.post("/api/users/signin", 
    validationRules,
    ValidateRequestMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        const {email, password} = req.body;

        const user = users.find(user => user.email === email && user.password === password);
        if (!user) {
            throw new NotFoundError("Email or Password is incorrect!");
        }
        
        const userJwt = jwt.sign(
            {
                email: email,
            },
            "secretkey"
        );
        req.session = {
            jwt: userJwt,
        };
        res.status(200).send();
        return;
    }
);

export {router};