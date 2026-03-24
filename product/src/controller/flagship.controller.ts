import { Request, Response } from "express";
import { body } from "express-validator";
import { ApiResponse, routeParam } from "@tabletennisshop/common";
import { FlagshipService } from "../services/flagship.service";

export const addFlagshipValidation = [
  body("product_id").isMongoId().withMessage("Valid product_id is required"),
  body("sortOrder").isInt({ min: 0 }).withMessage("sortOrder must be a non-negative integer"),
];

export async function getFlagshipProducts(_req: Request, res: Response<ApiResponse>) {
  const items = await FlagshipService.listActiveWithProducts();
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: items,
  });
}

export async function addFlagshipEntry(req: Request, res: Response<ApiResponse>) {
  const { product_id, sortOrder } = req.body;
  const entry = await FlagshipService.addEntry({
    product_id,
    sortOrder: Number(sortOrder),
  });
  res.status(201).json({
    success: true,
    statusCode: 201,
    data: entry,
  });
}

export async function removeFlagshipEntry(req: Request, res: Response<ApiResponse>) {
  const id = routeParam(req, "id");
  await FlagshipService.removeEntryById(id);
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: null,
  });
}
