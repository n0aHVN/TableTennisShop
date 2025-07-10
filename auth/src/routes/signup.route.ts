import express from "express";
import { signupController, signupValidationRules } from "../controllers/signup.controller";
import { ValidateRequestMiddleware } from "@tabletennisshop/common";

const router = express.Router();

router.post(
  "/api/users/signup",
  signupValidationRules,
  ValidateRequestMiddleware,
  signupController
);

export { router as signupRouter };
