import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, {Types} from 'mongoose';
import { OrderAttrs, OrderDoc, OrderModel } from '../models/order.model';
import {OrderStatusEnum, PaymentMethodEnum } from '@tabletennisshop/common';
import { InventoryAttrs, InventoryDoc, InventoryModel } from '../models/inventory.model';
import jwt from 'jsonwebtoken';
declare global{
    function signin(): Promise<string>;
    function prepareData(): Promise<{ inventoryDoc: InventoryDoc; orderDoc: OrderDoc }>;
}

let mongo:any;
let userId: string = new Types.ObjectId().toHexString();

jest.setTimeout(10000);
jest.mock('../NatsWrapper');

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
    const payload = { _id: userId, email };
    const token = jwt.sign(payload, process.env.JWT_KEY!);
    const sessionJson = JSON.stringify({ jwt: token });

    const base64 = Buffer.from(sessionJson).toString('base64');
    return `session=${base64}`;
}

global.prepareData = async()=>{
    const product_id = new mongoose.Types.ObjectId().toHexString();
    const inventory:InventoryAttrs = {
        _id: new mongoose.Types.ObjectId().toHexString(),
        product_id: product_id,
        total_quantity: 100,
        version: 0
    }
    const inventoryDoc = InventoryModel.build(inventory);
    await inventoryDoc.save();

    const order : OrderAttrs = {
        user_id: userId,
        status: OrderStatusEnum.PENDING,
        products: [{
            product_id: product_id,
            price: 100,
            quantity: 2
        }],
        payment_method: PaymentMethodEnum.COD,
        total_price: 200,
        expiresAt: new Date(Date.now() + 1000 * 60) // 1 minute from now
    }
    const orderDoc = OrderModel.build(order);
    await orderDoc.save();


    return { inventoryDoc, orderDoc };
}