
import express from 'express'
import { addQuantityController } from '../controller/addItem.controller';
import { subjectQuantityController } from '../controller/subjectItem.controller';
const router = express.Router();

router.patch("/api/inventory/:id/add", addQuantityController);
router.patch("/api/inventory/:id/subject", subjectQuantityController);



export {router as inventoryRouter};