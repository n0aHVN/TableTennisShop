import express from "express";
import { signinController, signinValidationRules } from "../controllers/signin.controller";
import { ValidateRequestMiddleware } from "@tabletennisshop/common";
import { UserService } from "../services/user.service";

const router = express.Router();

router.post(
  "/api/users/signin",
  signinValidationRules,
  ValidateRequestMiddleware,
  signinController
);

export { router as signinRouter };
