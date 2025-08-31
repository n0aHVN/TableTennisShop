
import express from 'express'
import { addQuantityController } from '../controller/addItem.controller';
import { subtractQuantityController } from '../controller/subjectItem.controller';
import { updateInventoryController } from '../controller/updateInventory.controller';
import { createInventoryController, createInventoryValidator } from '../controller/createInventory.controller';
import { ValidateRequestMiddleware } from '@tabletennisshop/common';
import { getInventoryByProductIdController } from '../controller/getInventoryByProductId.controller';
const router = express.Router();

router.get("/api/inventory/product/:id", getInventoryByProductIdController);
router.patch("/api/inventory/:id/add", addQuantityController);
router.patch("/api/inventory/:id/subtract", subtractQuantityController);

router.put("/api/inventory/:id", updateInventoryController);
router.post("/api/inventory", createInventoryValidator, ValidateRequestMiddleware, createInventoryController);

export {router as inventoryRouter};