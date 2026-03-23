import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { UserService } from "../services/user.service";
import { ApiResponse } from "@tabletennisshop/common";

export const signinValidationRules = [
  body("email")
    .notEmpty().withMessage("Email is required"),
  body("password")
    .trim()
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 4, max: 20 }).withMessage("Password must be between 4 and 20 characters"),
];

export const signinController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const { email, password } = req.body;
    const { clientJwt } = await UserService.authenticateUser({ email, password });
    // Asign JWT
    req.session!.jwt = clientJwt;
    const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: "User signed in successfully"
    };
    res.status(200).send(response);
};

