import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, {Types} from 'mongoose';
import {OrderStatusEnum, PaymentMethodEnum, ProductStatusEnum, ProductTypeEnum } from '@tabletennisshop/common';
import { InventoryAttrs, InventoryDoc, InventoryModel } from '../models/inventory.model';
import jwt from 'jsonwebtoken';
import { ProductAttrsBase, ProductDoc, ProductModel } from '../models/product.model';
declare global{
    function signin(): Promise<string>;
    function prepareData(): Promise<{ inventoryDoc: InventoryDoc; productDoc: ProductDoc }>;
}
jest.setTimeout(10000);
jest.mock('../NatsWrapper');
let mongo:any;
let userId: Types.ObjectId = new Types.ObjectId();
beforeAll(
    async () => {
        process.env.JWT_KEY = "secretkey";
        mongo = await MongoMemoryServer.create();
        const mongoUrl = mongo.getUri();
        await mongoose.connect(mongoUrl);
    }
)

beforeEach(
    async ()=>{
        jest.clearAllMocks();
        const collections = await mongoose.connection.db!.collections();
        for (const collection of collections) {
            await collection.deleteMany({});
        }
    }
)
afterAll(
    async()=>{
        await mongo.stop();
        await mongoose.connection.close();
    }
)

global.signin = async ()=>{
    const email = 'test@test.com';
    const payload = { _id: userId.toHexString(), email };
    const token = jwt.sign(payload, process.env.JWT_KEY!);
    const sessionJson = JSON.stringify({ jwt: token });

    const base64 = Buffer.from(sessionJson).toString('base64');
    return `session=${base64}`;
}

global.prepareData = async()=>{
    console.log("User ID:", userId);
    const product_id = new mongoose.Types.ObjectId().toHexString();
    const inventory:InventoryAttrs = {
        _id: new mongoose.Types.ObjectId().toHexString(),
        product_id: product_id,
        total_quantity: 100,
        version: 0
    }
    const inventoryDoc = InventoryModel.build(inventory);
    await inventoryDoc.save();

    const product: ProductAttrsBase = {
        name: "Test Shirt",
        slug: "test-shirt",
        brand: "TestBrand",
        description: "A test shirt product",
        sport: "table-tennis",
        type: ProductTypeEnum.SHIRT, // or ProductTypeEnum.RACKET, etc.
        attributes: {},
        price: 199000,
        status: ProductStatusEnum.OUT_OF_STOCK
    }
    const productDoc = (ProductModel as any).buildProduct(product);
    productDoc._id = product_id; // Manually set the _id to match inventory's product_id
    console.log("Product ID:", productDoc._id);
    await productDoc.save();

    return { inventoryDoc, productDoc };
}