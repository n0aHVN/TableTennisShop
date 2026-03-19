
import express from 'express'
import { addQuantityController } from '../controller/addItem.controller';
import { subtractQuantityController } from '../controller/subjectItem.controller';
import { updateInventoryController } from '../controller/updateInventory.controller';
import { createInventoryController, createInventoryValidator } from '../controller/createInventory.controller';
import { ValidateRequestMiddleware } from '@tabletennisshop/common';
import { getInventoryByProductIdController } from '../controller/getInventoryByProductId.controller';
import { createImportController, createImportValidator } from '../controller/createImport.controller';
import { getImportItemsByProductIdController, getAvailableItemsByProductIdController, getImportsByProductIdController } from '../controller/getImportItems.controller';
const router = express.Router();

router.get("/api/inventory/product/:id", getInventoryByProductIdController);
router.patch("/api/inventory/:id/add", addQuantityController);
router.patch("/api/inventory/:id/subtract", subtractQuantityController);

router.put("/api/inventory/:id", updateInventoryController);
router.post("/api/inventory", createInventoryValidator, ValidateRequestMiddleware as express.RequestHandler, createInventoryController);

router.post("/api/inventory/import", createImportValidator, ValidateRequestMiddleware as express.RequestHandler, createImportController);
router.get("/api/inventory/import/product/:id", getImportsByProductIdController);
router.get("/api/inventory/import-items/product/:id", getImportItemsByProductIdController);
router.get("/api/inventory/import-items/product/:id/available", getAvailableItemsByProductIdController);

export {router as inventoryRouter};