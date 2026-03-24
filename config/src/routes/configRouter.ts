import express from "express";
import {
  createLandingConfig,
  createLandingConfigValidation,
  getLandingConfigById,
  getLandingConfigs,
  updateLandingConfig,
  updateLandingConfigValidation,
} from "../controller/landingConfig.controller";
import { ValidateRequestMiddleware } from "@tabletennisshop/common";

const configRouter = express.Router();

configRouter.get("/api/config/landing", getLandingConfigs);
configRouter.get("/api/config/landing/:id", getLandingConfigById);
configRouter.post(
  "/api/config/landing",
  createLandingConfigValidation,
  ValidateRequestMiddleware,
  createLandingConfig
);
configRouter.put(
  "/api/config/landing/:id",
  updateLandingConfigValidation,
  ValidateRequestMiddleware,
  updateLandingConfig
);

export { configRouter };
