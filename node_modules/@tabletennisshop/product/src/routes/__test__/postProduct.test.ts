import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../NatsWrapper';
import { ProductTypeEnum, ProductStatusEnum } from '@tabletennisshop/common';
import { ProductAttrsBase, ProductModel } from '../../models/product.model';

it('creates a product and publishes an event', async () => {
    const product: ProductAttrsBase = {
        name: "Test Shirt",
        slug: "test-shirt",
        brand: "TestBrand",
        description: "A test shirt product",
        sport: "table-tennis",
        type: ProductTypeEnum.SHIRT, // or ProductTypeEnum.RACKET, etc.
        attributes: [],
        price: 199000,
        status: ProductStatusEnum.OUT_OF_STOCK,

    }

    const response = await request(app).post('/api/products').set('Cookie', await global.signin()).send(product).expect(201);

    const newProductDoc = await ProductModel.findById(response.body.data._id);
    expect(newProductDoc).toBeDefined();
    console.log("Created Product:", newProductDoc);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});