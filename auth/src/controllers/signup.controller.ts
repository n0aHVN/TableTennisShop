import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { UserService } from "../services/user.service";


export const signupValidationRules = [
  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Email must be a valid email address"),
  body("password")
    .trim()
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 4, max: 20 }).withMessage("Password must be between 4 and 20 characters"),
];

export const signupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await UserService.addUser(req.body);
    res.status(200).send({ message: "User is successfully created" });
  } catch (err) {
    next(err);
  }
};
