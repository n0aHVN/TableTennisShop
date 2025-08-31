import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, {Types} from 'mongoose';
import jwt from 'jsonwebtoken';
declare global{
    function signin(): Promise<string>;
    function getUserId(): Promise<string>;
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

global.getUserId = async ()=>{
    return userId;
}