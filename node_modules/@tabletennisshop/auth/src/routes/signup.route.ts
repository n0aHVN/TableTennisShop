import express from "express";
import { signupClientController, signupValidationRules } from "../controllers/signup.controller";
import { ValidateRequestMiddleware } from "@tabletennisshop/common";

const router = express.Router();

router.post(
  "/api/users/signup",
  signupValidationRules,
  ValidateRequestMiddleware,
  signupClientController
);

export { router as signupRouter };
