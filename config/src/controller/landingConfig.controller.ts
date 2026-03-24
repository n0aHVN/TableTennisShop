import { Request, Response } from "express";
import { body, param } from "express-validator";
import mongoose from "mongoose";
import { ApiResponse, routeParam } from "@tabletennisshop/common";
import { LandingConfigDoc } from "../models/landingConfig.model";
import { LandingConfigService } from "../services/landingConfig.service";

export function serializeLandingConfig(doc: LandingConfigDoc) {
  return {
    id: doc._id.toHexString(),
    section: doc.section,
    productId: doc.productId ? doc.productId.toHexString() : null,
    mediaUrl: doc.mediaUrl,
    title: doc.title,
    subtitle: doc.subtitle,
    isActive: doc.isActive,
    updatedAt: doc.updatedAt,
  };
}

export async function getLandingConfigs(req: Request, res: Response<ApiResponse>) {
  const section = typeof req.query.section === "string" ? req.query.section : undefined;
  const activeOnly =
    req.query.activeOnly === "false" || req.query.activeOnly === "0" ? false : true;

  const items = await LandingConfigService.list({ section, activeOnly });
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: items.map(serializeLandingConfig),
  });
}

export async function getLandingConfigById(req: Request, res: Response<ApiResponse>) {
  const id = routeParam(req, "id");
  const doc = await LandingConfigService.findById(id);
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: serializeLandingConfig(doc),
  });
}

export const createLandingConfigValidation = [
  body("section").isString().notEmpty().withMessage("section is required"),
  body("mediaUrl").isString().notEmpty().withMessage("mediaUrl (MinIO object key) is required"),
  body("title").isString().notEmpty().withMessage("title is required"),
  body("subtitle").isString().notEmpty().withMessage("subtitle is required"),
  body("productId")
    .optional({ nullable: true })
    .custom((v) => v === null || v === undefined || mongoose.isValidObjectId(String(v)))
    .withMessage("productId must be a Mongo id or null"),
  body("isActive").optional().isBoolean().withMessage("isActive must be boolean"),
];

export async function createLandingConfig(req: Request, res: Response<ApiResponse>) {
  const { section, productId, mediaUrl, title, subtitle, isActive } = req.body;
  const doc = await LandingConfigService.create({
    section,
    productId: productId ?? null,
    mediaUrl,
    title,
    subtitle,
    isActive,
  });
  res.status(201).json({
    success: true,
    statusCode: 201,
    data: serializeLandingConfig(doc),
  });
}

export const updateLandingConfigValidation = [
  param("id").isMongoId().withMessage("Invalid id"),
  body("section").optional().isString().notEmpty(),
  body("mediaUrl").optional().isString().notEmpty(),
  body("title").optional().isString().notEmpty(),
  body("subtitle").optional().isString().notEmpty(),
  body("productId")
    .optional({ nullable: true })
    .custom(
      (v) => v === null || v === undefined || mongoose.isValidObjectId(String(v))
    ),
  body("isActive").optional().isBoolean(),
];

export async function updateLandingConfig(req: Request, res: Response<ApiResponse>) {
  const id = routeParam(req, "id");
  const doc = await LandingConfigService.update(id, req.body);
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: serializeLandingConfig(doc),
  });
}
