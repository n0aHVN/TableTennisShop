import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { UserService } from "../services/user.service";
import { ApiResponse } from "@tabletennisshop/common";


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
    const response :ApiResponse = {
      statusCode: 201,
      message: "User is successfully created",
      success: true
    };
    res.send(response);
  } catch (err) {
    next(err);
  }
};
