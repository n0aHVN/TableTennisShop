import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { UserService } from "../services/user.service";

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
    const { clientJwt, message } = await UserService.authenticateUser({ email, password });
    req.session!.jwt = clientJwt;
    res.status(200).send(message);
};

