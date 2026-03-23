import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { UserService } from "../services/user.service";
import { ApiResponse, RoleEnum, UserStatusEnum } from "@tabletennisshop/common";


export const signupValidationRules = [
  body("username")
    .notEmpty().withMessage("Username is required")
    .isLength({ min: 4, max: 100 }).withMessage("Username must be between 4 and 100 characters"),
  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Email must be a valid email address"),
  body("password")
    .trim()
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 4, max: 20 }).withMessage("Password must be between 4 and 20 characters"),
  body("full_name")
    .notEmpty().withMessage("Full name is required"),
  body("address")
    .notEmpty().withMessage("Address is required"),
];

export const signupClientController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await UserService.addUser({
      user: req.body,
      type: RoleEnum.CUSTOMER,
      status: UserStatusEnum.ENABLE
    });
    const response :ApiResponse = {
      statusCode: 201,
      message: "User is successfully created",
      success: true
    };
    res.status(201).send(response);
  } catch (err) {
    next(err);
  }
};
