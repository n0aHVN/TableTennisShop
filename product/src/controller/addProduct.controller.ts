import { body } from 'express-validator';
import { ProductModel } from '../models/product.model';
import { ApiResponse, ProductTypeEnum } from '@tabletennisshop/common';
import { Request, Response } from 'express';
import { natsWrapper } from '../NatsWrapper';
import { ProductCreatedPublisher } from '../events/publishers/ProductCreatedPublisher';

export const addProductValidation = [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('slug').isString().notEmpty().withMessage('Slug is required'),
    body('brand').isString().notEmpty().withMessage('Brand is required'),
    body('description').optional().isString(),
    body('type').isString().notEmpty().withMessage('Type is required')
        .isIn(Object.values(ProductTypeEnum)).withMessage("Type must be one of: " + Object.values(ProductTypeEnum).join(", ")),
    body('attributes').isArray().withMessage('Attributes must be an array'),
    body('price').isNumeric().withMessage('Price must be a number'),
];
export async function addProductController(req: Request, res: Response<ApiResponse>) {
    // ...implementation
    const product = req.body;
    const productDoc = (ProductModel as any).buildProduct(product);
    await productDoc.save();
    const response: ApiResponse = {
        success: true,
        data: productDoc,
        statusCode: 201
    };

    new ProductCreatedPublisher(natsWrapper.client).publish({
        _id: productDoc._id.toHexString(),
        price: productDoc.price,
        status: productDoc.status,
        version: productDoc.version
    });

    res.status(201).json(response);
}