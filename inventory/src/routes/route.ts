
import express from 'express'
import { addQuantityController } from '../controller/addItem.controller';
import { subtractQuantityController } from '../controller/subjectItem.controller';
import { updateInventoryController } from '../controller/updateInventory.controller';
const router = express.Router();

router.patch("/api/inventory/:id/add", addQuantityController);
router.patch("/api/inventory/:id/subtract", subtractQuantityController);

router.put("/api/inventory/:id", updateInventoryController);


export {router as inventoryRouter};